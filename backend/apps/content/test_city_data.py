from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import PortalAccess


def metadata(**columns):
    return {"columns": [{"fieldName": field, "dataTypeName": kind} for field, kind in columns.items()]}


class EdmontonDataTests(TestCase):
    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username="city-agent")
        PortalAccess.objects.create(user=self.user, role=PortalAccess.Role.READ_ONLY)

    @patch("apps.content.city_data.fetch_json")
    def test_residential_totals_use_latest_confirmed_assessment_year_and_cache(self, fetch):
        path = "/api/city-data/assessment/summary/"
        self.assertIn(self.client.get(path).status_code, (401, 403))
        self.client.force_authenticate(self.user)
        fetch.side_effect = [
            metadata(neighbourhood="text", assessed_value="number", assessment_class_1="text", assessment_year="number"),
            [{"assessment_year": "2025"}],
            [{"records": "12", "average_assessment": "455000"}],
            [{"neighbourhood": "Keswick", "records": "4", "average_assessment": "530000"}],
        ]
        response = self.client.get(path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["year"], "2025")
        self.assertEqual(response.json()["neighbourhoods"][0]["neighbourhood"], "Keswick")
        totals_query = parse_qs(urlsplit(fetch.call_args_list[2].args[0]).query)
        self.assertIn("upper(assessment_class_1) = 'RESIDENTIAL'", totals_query["$where"][0])
        self.assertIn("assessment_year = 2025", totals_query["$where"][0])
        self.assertEqual(self.client.get(path).json(), response.json())
        self.assertEqual(fetch.call_count, 4)

    @override_settings(EDMONTON_DEVELOPMENT_DATASET="abcd-1234")
    @patch("apps.content.city_data.fetch_json")
    def test_permits_and_address_lookup_validate_input_and_use_supported_columns(self, fetch):
        self.client.force_authenticate(self.user)
        path = "/api/city-data/development/"
        self.assertEqual(self.client.get(path + "summary/", {"year": "2026 AND 1=1"}).status_code, 400)
        self.assertEqual(self.client.get(path + "lookup/", {"address": "12 *"}).status_code, 400)
        fetch.assert_not_called()
        fetch.side_effect = [
            metadata(issue_date="calendar_date", construction_value="number", address="text"),
            [{"month": "2", "permits": "3", "declared_value": "100000"}],
            [{"address": "12 O'BRIEN AVE NW", "issued": "2025-02-02T00:00:00"}],
        ]
        result = self.client.get(path + "summary/", {"year": "2025"})
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json()["months"][0]["permits"], "3")
        self.assertIn("date_extract_m(issue_date)", parse_qs(urlsplit(fetch.call_args.args[0]).query)["$select"][0])
        result = self.client.get(path + "lookup/", {"address": "12 O'Brien Ave NW"})
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json()["records"][0]["address"], "12 O'BRIEN AVE NW")
        self.assertIn("'12 O''BRIEN AVE NW%'", parse_qs(urlsplit(fetch.call_args.args[0]).query)["$where"][0])
