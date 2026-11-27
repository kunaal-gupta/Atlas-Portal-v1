import json
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from .market_news import CACHE_KEY
from .models import PortalAccess


class EdmontonNewsTests(TestCase):
    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)
        self.client = APIClient()
        self.url = reverse("edmonton-news")
        self.user = get_user_model().objects.create_user(username="news-agent")
        PortalAccess.objects.create(user=self.user, role=PortalAccess.Role.READ_ONLY)

    @override_settings(APITUBE_API_KEY="")
    @patch("apps.content.market_news.fetch_google_headlines", side_effect=OSError)
    def test_feed_requires_portal_access_and_reports_upstream_failure(self, google):
        self.assertIn(self.client.get(self.url).status_code, (401, 403))
        self.client.force_authenticate(self.user)
        with self.assertLogs("apps.content.market_news", level="WARNING"):
            self.assertEqual(self.client.get(self.url).status_code, 503)
        google.assert_called_once()

    @override_settings(APITUBE_API_KEY="test-key")
    @patch("apps.content.market_news.HTTPSConnection")
    def test_filters_and_caches_headlines_then_serves_stale_on_failure(self, connection_class):
        self.client.force_authenticate(self.user)
        connection = connection_class.return_value
        upstream = connection.getresponse.return_value
        upstream.status = 200
        article = {
            "title": "Edmonton home sales rise",
            "href": "https://publisher.example/homes?campaign=first",
            "source": {"domain": "publisher.example"},
            "published_at": "2026-11-19T14:00:00Z",
        }
        upstream.read.return_value = json.dumps({"results": [
            article,
            {**article, "href": "https://publisher.example/homes?campaign=duplicate"},
            {**article, "title": "Edmonton Oilers win", "href": "https://publisher.example/sport"},
            {**article, "href": "javascript:alert(1)"},
        ]}).encode()

        body = self.client.get(self.url).json()
        self.assertFalse(body["stale"])
        self.assertEqual(body["results"], [{
            "title": article["title"],
            "url": article["href"],
            "publisher": "publisher.example",
            "published_at": article["published_at"],
        }])
        method, target = connection.request.call_args.args
        self.assertEqual(method, "GET")
        self.assertEqual(parse_qs(urlsplit(target).query), {
            "title": ["Edmonton"], "language.code": ["en"], "per_page": ["10"],
        })
        self.assertEqual(connection.request.call_args.kwargs["headers"]["X-API-Key"], "test-key")
        self.assertEqual(self.client.get(self.url).json(), body)
        connection.request.assert_called_once()

        cache.delete_many([CACHE_KEY, CACHE_KEY + ":refresh"])
        upstream.status = 429
        with self.assertLogs("apps.content.market_news", level="WARNING") as logs:
            self.assertEqual(self.client.get(self.url).json(), {**body, "stale": True})
        self.assertIn("HTTP 429", logs.output[0])
        self.assertNotIn("test-key", logs.output[0])

    @override_settings(APITUBE_API_KEY="test-key")
    @patch("apps.content.market_news.read_feed")
    def test_google_rss_supplies_headlines_when_apitube_has_no_matches(self, read_feed):
        self.client.force_authenticate(self.user)
        read_feed.side_effect = [
            b'{"results": [{"title": "Edmonton hockey news"}]}',
            b"""<rss><channel><item>
              <title>Edmonton home sales rise - Local Paper</title>
              <link>https://news.google.com/rss/articles/story</link>
              <pubDate>Thu, 19 Nov 2026 14:00:00 GMT</pubDate>
              <source>Local Paper</source>
            </item></channel></rss>""",
        ]
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["results"], [{
            "title": "Edmonton home sales rise",
            "url": "https://news.google.com/rss/articles/story",
            "publisher": "Local Paper",
            "published_at": "2026-11-19T14:00:00+00:00",
        }])
        self.assertEqual(read_feed.call_args.args[0], "news.google.com")
        self.assertEqual(self.client.get(self.url).json(), response.json())
        self.assertEqual(read_feed.call_count, 2)
