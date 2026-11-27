"""Bounded, read-only Socrata queries against Edmonton's public data portal."""

import json
import logging
import re
from datetime import date, timedelta
from hashlib import sha256
from http.client import HTTPException, HTTPSConnection
from urllib.parse import urlencode

from django.conf import settings
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import HasPortalAccess

logger = logging.getLogger(__name__)
DATASET_ID = re.compile(r"[a-z0-9]{4}-[a-z0-9]{4}")
ADDRESS = re.compile(r"([0-9]{1,8}[A-Z]?)\s+([A-Z0-9][A-Z0-9 '\-]{1,79})")
MAX_BODY = 2 * 1024 * 1024
MAP_LIMIT = 1500
MAP_BOUNDS = (53.25, -113.85, 53.77, -113.15)  # south, west, north, east

SOURCES = {
    "assessment": ("EDMONTON_ASSESSMENT_DATASET", "Property assessment", 7 * 86400),
    "property": ("EDMONTON_PROPERTY_DATASET", "Property information", 7 * 86400),
    "building": ("EDMONTON_BUILDING_DATASET", "Building permits", 86400),
    "development": ("EDMONTON_DEVELOPMENT_DATASET", "Development permits", 86400),
}
FIELDS = {
    "point": ("point_location", "location", "geocoded_column", "geo_point"),
    "neighbourhood": ("neighbourhood", "neighbourhood_name"),
    "value": ("assessed_value", "total_assessed_value"),
    "year": ("assessment_year", "tax_year"),
    "assessment_class": ("assessment_class_1", "assessment_class"),
    "number": ("house_number", "street_number"),
    "street": ("street_name", "street"),
    "address": ("address", "site_address", "property_address"),
    "suite": ("suite", "unit_number"),
    "lot_area": ("lot_area", "lot_size"),
    "building_type": ("building_type", "job_category"),
    "built_year": ("year_built", "building_year_built"),
    "issued": ("issue_date", "issued_date", "permit_issue_date", "permit_date", "issueddate"),
    "permit_number": ("permit_number", "permit_id", "permit_num", "job_number"),
    "description": ("work_description", "description", "job_description"),
    "construction_value": ("construction_value", "project_value"),
}
DATE_TYPES = {"calendar_date", "fixed_timestamp", "floating_timestamp", "date"}
NUMBER_TYPES = {"number", "money", "double"}


class CityDataError(Exception):
    pass


def fetch_json(path):
    connection = HTTPSConnection("data.edmonton.ca", timeout=5)
    try:
        headers = {"Accept": "application/json"}
        if settings.EDMONTON_OPEN_DATA_TOKEN:
            headers["X-App-Token"] = settings.EDMONTON_OPEN_DATA_TOKEN
        connection.request("GET", path, headers=headers)
        response = connection.getresponse()
        if response.status != 200:
            raise CityDataError(f"HTTP {response.status}")
        body = response.read(MAX_BODY + 1)
        if len(body) > MAX_BODY:
            raise CityDataError("response exceeds limit")
        return json.loads(body)
    finally:
        connection.close()


def rows(dataset, **query):
    body = fetch_json(f"/resource/{dataset}.json?{urlencode(query)}")
    if not isinstance(body, list) or any(not isinstance(row, dict) for row in body):
        raise CityDataError("unexpected rows")
    return body


def schema(dataset):
    key = f"atlas:edmonton:schema:v3:{dataset}"
    cached = cache.get(key)
    if cached is not None:
        return cached
    metadata = fetch_json(f"/api/views/{dataset}.json")
    if not isinstance(metadata, dict) or not isinstance(metadata.get("columns"), list):
        raise CityDataError("unexpected dataset metadata")
    columns = {
        column.get("fieldName"): column.get("dataTypeName")
        for column in metadata["columns"] if isinstance(column, dict)
    }
    mapping = {
        name: next((candidate for candidate in aliases if candidate in columns), None)
        for name, aliases in FIELDS.items()
    }
    mapping["issued"] = next((field for field in FIELDS["issued"] if columns.get(field) in DATE_TYPES), None)
    for name in ("value", "construction_value"):
        mapping[name] = next((field for field in FIELDS[name] if columns.get(field) in NUMBER_TYPES), None)
    mapping["point"] = next(
        (field for field in FIELDS["point"] if columns.get(field) in {"point", "location"}), None
    )
    mapping["numeric_year"] = columns.get(mapping["year"]) in NUMBER_TYPES
    mapping["numeric_address"] = columns.get(mapping["number"]) in NUMBER_TYPES
    cache.set(key, mapping, 86400)
    return mapping


def require(mapping, *names):
    if not all(mapping[name] for name in names):
        raise CityDataError("required dataset columns unavailable")


def quoted(value):
    return "'" + value.replace("'", "''") + "'"


def residential_scope(dataset, fields):
    require(fields, "value", "assessment_class")
    value, category = (fields[name] for name in ("value", "assessment_class"))
    where = f"upper({category}) = 'RESIDENTIAL' AND {value} IS NOT NULL"
    year = None
    if fields["year"]:
        year_column = fields["year"]
        latest = rows(dataset, **{"$select": f"max({year_column}) as assessment_year"})
        year = str(latest[0].get("assessment_year", "")) if latest else ""
        if not re.fullmatch(r"[0-9]{4}", year):
            raise CityDataError("assessment year unavailable")
        year_value = year if fields["numeric_year"] else quoted(year)
        where += f" AND {year_column} = {year_value}"
    return where, year


def assessment_summary(dataset, fields):
    require(fields, "neighbourhood")
    where, year = residential_scope(dataset, fields)
    neighbourhood, value = fields["neighbourhood"], fields["value"]
    totals = rows(dataset, **{
        "$select": f"count(*) as records, avg({value}) as average_assessment", "$where": where,
    })
    areas = rows(dataset, **{
        "$select": f"{neighbourhood} as neighbourhood, count(*) as records, avg({value}) as average_assessment",
        "$where": f"{where} AND {neighbourhood} IS NOT NULL",
        "$group": neighbourhood, "$order": "records DESC", "$limit": 15,
    })
    return {"year": year, "totals": totals[0] if totals else {}, "neighbourhoods": areas}


def parse_map_bounds(raw):
    if raw is None:
        return MAP_BOUNDS
    if len(raw) > 100:
        raise ValueError("Invalid map bounds")
    south, west, north, east = (round(float(value), 3) for value in raw.split(","))
    min_lat, min_lng, max_lat, max_lng = MAP_BOUNDS
    if not (min_lat <= south < north <= max_lat and min_lng <= west < east <= max_lng):
        raise ValueError("Invalid map bounds")
    return south, west, north, east


def assessment_map(dataset, fields, bounds):
    require(fields, "point")
    where, year = residential_scope(dataset, fields)
    south, west, north, east = bounds
    where += f" AND within_box({fields['point']}, {north}, {west}, {south}, {east})"
    records = rows(dataset, **{
        "$select": select_fields(fields, ("point", "value", "neighbourhood")),
        "$where": where,
        "$limit": MAP_LIMIT + 1,
    })
    points = []
    for record in records[:MAP_LIMIT]:
        point = record.get("point")
        if not isinstance(point, dict):
            continue
        coordinates = point.get("coordinates")
        try:
            if isinstance(coordinates, list) and len(coordinates) == 2:
                lng, lat = map(float, coordinates)
            else:
                lat, lng = float(point.get("latitude")), float(point.get("longitude"))
        except (ValueError, TypeError, OverflowError):
            continue
        if south <= lat <= north and west <= lng <= east:
            points.append({
                "lat": lat, "lng": lng,
                "value": record.get("value"), "neighbourhood": record.get("neighbourhood"),
            })
    return {"points": points, "limit": MAP_LIMIT, "limited": len(records) > MAP_LIMIT, "year": year}


def permit_summary(dataset, fields, year):
    require(fields, "issued")
    issued = fields["issued"]
    end = int(year) + 1
    where = f"{issued} >= '{year}-01-01T00:00:00' AND {issued} < '{end}-01-01T00:00:00'"
    month = f"date_extract_m({issued})"
    select = f"{month} as month, count(*) as permits"
    if fields["construction_value"]:
        select += f", sum({fields['construction_value']}) as declared_value"
    return {"year": year, "months": rows(dataset, **{
        "$select": select, "$where": where, "$group": month, "$order": "month ASC", "$limit": 12,
    })}


def select_fields(fields, names):
    return ", ".join(f"{fields[name]} as {name}" for name in names if fields[name])


def permit_alerts(dataset, fields):
    require(fields, "issued")
    issued = fields["issued"]
    public_fields = ("issued", "permit_number", "neighbourhood", "description", "building_type")
    cutoff = (date.today() - timedelta(days=30)).isoformat()
    return {"records": rows(dataset, **{
        "$select": select_fields(fields, public_fields),
        "$where": f"{issued} >= '{cutoff}T00:00:00'",
        "$order": f"{issued} DESC", "$limit": 8,
    })}


def property_lookup(dataset, fields, address):
    number, street = ADDRESS.fullmatch(address).groups()
    if fields["number"] and fields["street"]:
        if fields["numeric_address"] and not number.isdigit():
            return {"records": []}
        number_value = str(int(number)) if fields["numeric_address"] else quoted(number)
        where = f"{fields['number']} = {number_value} AND upper({fields['street']}) LIKE {quoted(street + '%')}"
    else:
        require(fields, "address")
        where = f"upper({fields['address']}) LIKE {quoted(address + '%')}"
    select = select_fields(fields, (
        "number", "street", "address", "suite", "neighbourhood", "value", "year",
        "assessment_class", "lot_area", "building_type", "built_year",
        "issued", "permit_number", "description",
    ))
    return {"records": rows(dataset, **{"$select": select, "$where": where, "$limit": 15})}


class EdmontonDataView(APIView):
    permission_classes = [HasPortalAccess]

    def get(self, request, source, operation):
        allowed_operations = {
            "assessment": ("summary", "lookup", "map"), "property": ("lookup",),
            "building": ("summary", "recent", "lookup"), "development": ("summary", "recent", "lookup"),
        }
        if operation not in allowed_operations.get(source, ()):
            return Response({"detail": "Unknown municipal data request."}, status=404)
        setting, label, lifetime = SOURCES[source]
        dataset = getattr(settings, setting)
        if not DATASET_ID.fullmatch(dataset):
            return Response({"detail": f"{label} is not configured."}, status=503)

        address = " ".join(request.query_params.get("address", "").upper().split())
        year = request.query_params.get("year", str(date.today().year))
        if operation == "lookup" and not ADDRESS.fullmatch(address):
            return Response({"detail": "Enter an Edmonton address starting with a street number."}, status=400)
        if operation == "summary" and source != "assessment" and (
            not re.fullmatch(r"[0-9]{4}", year) or not 2000 <= int(year) <= date.today().year
        ):
            return Response({"detail": "Select a valid permit year."}, status=400)

        bounds = None
        variant = address if operation == "lookup" else year if operation == "summary" and source != "assessment" else ""
        if operation == "map":
            try:
                bounds = parse_map_bounds(request.query_params.get("bounds"))
            except (ValueError, OverflowError):
                return Response({"detail": "Select a valid area within Edmonton."}, status=400)
            variant = str(bounds)
        key = f"atlas:edmonton:data:v1:{dataset}:{source}:{operation}:{sha256(variant.encode()).hexdigest()}"
        cached = cache.get(key)
        if cached is not None:
            return Response(cached)
        try:
            fields = schema(dataset)
            if operation == "lookup":
                result = property_lookup(dataset, fields, address)
            elif operation == "recent":
                result = permit_alerts(dataset, fields)
            elif operation == "map":
                result = assessment_map(dataset, fields, bounds)
            elif source == "assessment":
                result = assessment_summary(dataset, fields)
            else:
                result = permit_summary(dataset, fields, year)
        except CityDataError as error:
            logger.warning("Edmonton %s %s unavailable: %s", source, operation, error)
        except (OSError, HTTPException, ValueError) as error:
            logger.warning("Edmonton %s %s unavailable: %s", source, operation, type(error).__name__)
        else:
            data = {**result, "source_url": f"https://data.edmonton.ca/d/{dataset}"}
            cache.set(key, data, min(lifetime, 900) if operation in ("lookup", "map") else lifetime)
            return Response(data)
        return Response({"detail": f"{label} could not be loaded from the City of Edmonton."}, status=503)
