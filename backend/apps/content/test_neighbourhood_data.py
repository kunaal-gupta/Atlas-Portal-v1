from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from .models import PortalAccess
from .neighbourhood_data import CACHE_KEY


class NeighbourhoodDirectoryTests(TestCase):
    def setUp(self):
        cache.delete(CACHE_KEY)
        self.addCleanup(cache.delete, CACHE_KEY)
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username="neighbourhood-agent")
        PortalAccess.objects.create(user=self.user, role=PortalAccess.Role.READ_ONLY)

    @patch("apps.content.neighbourhood_data.PAGE_SIZE", 1)
    @patch("apps.content.neighbourhood_data.rows")
    @patch("apps.content.neighbourhood_data.fetch_json")
    def test_resolves_city_fields_and_pages_boundary_records(self, fetch, rows):
        url = "/api/city-data/neighbourhoods/"
        self.assertIn(self.client.get(url).status_code, (401, 403))
        fetch.assert_not_called()
        self.client.force_authenticate(self.user)
        fetch.return_value = {"columns": [
            {"name": "Neighbourhood Name", "fieldName": "neighbourhood_name", "dataTypeName": "text"},
            {"name": "Neighbourhood Number", "fieldName": "neighbourhood_number", "dataTypeName": "number"},
            {"name": "Descriptive Name", "fieldName": "descriptive_name", "dataTypeName": "text"},
            {"name": "Civic Ward", "fieldName": "ward", "dataTypeName": "text"},
            {"name": "Geometry Multipolygon", "fieldName": "geometry", "dataTypeName": "multipolygon"},
        ]}
        polygon = {"type": "Polygon", "coordinates": [[[-113.50, 53.50], [-113.49, 53.51], [-113.49, 53.50], [-113.50, 53.50]]]}
        rows.side_effect = [
            [{"name": "ALBANY", "number": 3460, "display_name": "Albany", "ward": "Anirniq", "boundary": polygon}],
            [],
        ]
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["results"][0]["boundary"], polygon)
        self.assertEqual(response.json()["results"][0]["number"], "3460")
        self.assertEqual(response.json()["results"][0]["ward"], "Anirniq")
        fetch.assert_called_once_with("/api/views/65fr-66s6.json")
        self.assertIn("geometry as boundary", rows.call_args_list[0].kwargs["$select"])
        self.assertEqual(rows.call_args.args, ("65fr-66s6",))
        self.assertEqual(rows.call_args.kwargs["$offset"], 1)
        self.assertEqual(self.client.get(url).json(), response.json())
        self.assertEqual(rows.call_count, 2)
