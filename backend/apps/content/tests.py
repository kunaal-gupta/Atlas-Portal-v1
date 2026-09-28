from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Agent, Document, DocumentCategory, Event, News, NewsArticle, Resource, ResourceCategory


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
        response = self.client.get(reverse("categories-list"))
        self.assertEqual([item["title"] for item in response.json()[0]["resources"]], ["Active"])

    def test_upcoming_events_exclude_finished_events(self):
        now = timezone.now()
        Event.objects.create(title="Future", start_at=now + timedelta(days=1), end_at=now + timedelta(days=1, hours=1), created_by=self.user)
        Event.objects.create(title="Past", start_at=now - timedelta(days=1), end_at=now - timedelta(hours=23), created_by=self.user)
        response = self.client.get(reverse("events-upcoming"))
        self.assertEqual(response.json()["count"], 1)
        self.assertEqual(response.json()["results"][0]["title"], "Future")

    def test_agent_directory_is_searchable_and_hides_internal_notes(self):
        Agent.objects.create(
            userid="agent-1",
            email="alex@example.com",
            full_name="Alex Morgan",
            access_role="Agent",
            professional_role="Sales Representative",
            location="Toronto",
            internal_notes="Private office note",
        )
        Agent.objects.create(userid="agent-2", email="sam@example.com", full_name="Sam Lee", access_role="Agent", location="Ottawa")

        response = self.client.get(reverse("agent-list"), {"search": "Toronto"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual([agent["full_name"] for agent in response.json()], ["Alex Morgan"])
        self.assertNotIn("internal_notes", response.json()[0])

    def test_seeded_agent_directory_data_is_available(self):
        april = Agent.objects.get(email="aprilsturko@gmail.com")
        self.assertEqual(april.full_name, "April Sturko")
        self.assertEqual(april.company, "Century  21 Masters")
        self.assertEqual(april.license_number, "")

        builders = Agent.objects.filter(professional_role="Builder / Developer")
        self.assertEqual(builders.count(), 5)


class AdminContentModelTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)

    def test_document_can_be_assigned_to_multiple_portal_pages(self):
        market = DocumentCategory.objects.get(name="Market")
        general = DocumentCategory.objects.get(name="General")
        document = Document.objects.create(
            title="Market guide", external_url="https://example.com/market-guide"
        )
        document.categories.set([market, general])

        self.assertCountEqual(document.categories.values_list("name", flat=True), ["Market", "General"])

    def test_document_admin_records_the_user_who_saved_it(self):
        category = DocumentCategory.objects.get(name="Agent")
        response = self.client.post(
            reverse("admin:content_document_add"),
            {
                "title": "Agent handbook",
                "external_url": "https://example.com/handbook",
                "categories": [category.pk],
                "_save": "Save",
            },
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(Document.objects.get().updated_by, self.user)

    def test_news_stores_admin_managed_metadata(self):
        article = News.objects.create(
            title="Office update",
            url="https://example.com/news",
            summary="The latest office news.",
            published_at=timezone.now(),
            keywords="office, update",
        )

        self.assertEqual(article.keywords, "office, update")
