"""City of Edmonton neighbourhood directory and boundary polygons."""

import logging
from http.client import HTTPException

from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.views import APIView

from .city_data import CityDataError, fetch_json, rows
from .permissions import HasPortalAccess

logger = logging.getLogger(__name__)
DATASET = "65fr-66s6"
CACHE_KEY = "atlas:edmonton:neighbourhood-boundaries:v1"
PAGE_SIZE = 50
MAX_PAGES = 20

FIELD_LABELS = {
    "number": ("neighbourhood number", "neighborhood number"),
    "name": ("neighbourhood name", "neighborhood name", "name"),
    "display_name": ("descriptive name",),
    "description": ("description",),
    "start_date": ("effective start date",),
    "end_date": ("effective end date",),
    "ward": ("civic ward", "ward"),
    "district": ("planning district",),
}


def normalized(value):
    return " ".join(str(value or "").lower().replace("_", " ").split())


def load_neighbourhoods():
    metadata = fetch_json(f"/api/views/{DATASET}.json")
    if not isinstance(metadata, dict) or not isinstance(metadata.get("columns"), list):
        raise CityDataError("unexpected dataset metadata")
    columns = [column for column in metadata["columns"] if isinstance(column, dict)]
    # Only interpolate City field identifiers that match the SoQL identifier form.
    columns = [
        column for column in columns
        if isinstance(column.get("fieldName"), str)
        and column["fieldName"].isascii()
        and column["fieldName"].isidentifier()
    ]
    labels = {normalized(column.get("name")): column["fieldName"] for column in columns}
    fields = {normalized(column["fieldName"]): column["fieldName"] for column in columns}
    mapping = {}
    for alias, candidates in FIELD_LABELS.items():
        for candidate in candidates:
            field = labels.get(candidate) or fields.get(candidate)
            if field:
                mapping[alias] = field
                break

    polygon = next((column["fieldName"] for column in columns
                    if column.get("dataTypeName") in {"multipolygon", "polygon"}), None)
    if not mapping.get("name") or not mapping.get("number") or not polygon:
        raise CityDataError("required neighbourhood columns unavailable")

    select = ", ".join([f"{field} as {alias}" for alias, field in mapping.items()] + [f"{polygon} as boundary"])
    results = []
    for page in range(MAX_PAGES):
        batch = rows(DATASET, **{
            "$select": select,
            "$order": f"{mapping['name']}, :id",
            "$limit": PAGE_SIZE,
            "$offset": page * PAGE_SIZE,
        })
        for item in batch:
            geometry = item.get("boundary")
            if not (
                isinstance(geometry, dict)
                and geometry.get("type") in {"Polygon", "MultiPolygon"}
                and isinstance(geometry.get("coordinates"), list)
            ):
                geometry = None
            if item.get("name") and item.get("number") is not None:
                results.append({
                    **{alias: str(item.get(alias) or "") for alias in FIELD_LABELS},
                    "boundary": geometry,
                })
        if len(batch) < PAGE_SIZE:
            return results
    raise CityDataError("neighbourhood dataset exceeds the row limit")


class EdmontonNeighbourhoodsView(APIView):
    permission_classes = [HasPortalAccess]

    def get(self, request):
        data = cache.get(CACHE_KEY)
        if data is not None:
            return Response(data)
        try:
            records = load_neighbourhoods()
        except CityDataError as error:
            logger.warning("Edmonton neighbourhood boundaries unavailable: %s", error)
        except (OSError, HTTPException, ValueError) as error:
            logger.warning("Edmonton neighbourhood boundaries unavailable: %s", type(error).__name__)
        else:
            data = {"results": records, "source_url": f"https://data.edmonton.ca/d/{DATASET}"}
            cache.set(CACHE_KEY, data, 7 * 86400)
            return Response(data)
        return Response({"detail": "City of Edmonton neighbourhood records are unavailable."}, status=503)
