from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Event, NewsArticle, Resource, ResourceCategory


class PortalApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username="editor", first_name="Portal", last_name="Editor")

    def test_published_news_and_featured_endpoint(self):
        article = NewsArticle.objects.create(title="Launch", excerpt="News", content="Content", author=self.user, department="Marketing", published_at=timezone.now(), is_featured=True)
        NewsArticle.objects.create(title="Draft", content="Hidden", author=self.user, department="Sales", published_at=timezone.now(), is_published=False)
        response = self.client.get(reverse("news-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)
        self.assertEqual(self.client.get(reverse("news-featured")).json()["id"], article.id)

    def test_categories_include_only_active_resources(self):
        category = ResourceCategory.objects.create(name="Forms")
        Resource.objects.create(category=category, title="Active", external_url="https://example.com")
        Resource.objects.create(category=category, title="Hidden", is_active=False)
        response = self.client.get(reverse("resourcecategory-list"))
        self.assertEqual([item["title"] for item in response.json()[0]["resources"]], ["Active"])

    def test_upcoming_events_exclude_finished_events(self):
        now = timezone.now()
        Event.objects.create(title="Future", start_at=now + timedelta(days=1), end_at=now + timedelta(days=1, hours=1), created_by=self.user)
        Event.objects.create(title="Past", start_at=now - timedelta(days=1), end_at=now - timedelta(hours=23), created_by=self.user)
        response = self.client.get(reverse("event-upcoming"))
        self.assertEqual(response.json()["count"], 1)
        self.assertEqual(response.json()["results"][0]["title"], "Future")

