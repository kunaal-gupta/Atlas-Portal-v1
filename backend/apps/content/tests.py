from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Agent, Agency, Document, DocumentCategory, News


class PortalApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username="editor", first_name="Portal", last_name="Editor")

    def test_news_endpoint_uses_admin_managed_news(self):
        article = News.objects.create(
            title="Launch",
            url="https://example.com/launch",
            summary="News",
            published_at=timezone.now(),
            keywords="launch, office",
        )
        response = self.client.get(reverse("news-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)
        self.assertEqual(response.json()["results"][0]["id"], article.id)
        self.assertEqual(response.json()["results"][0]["summary"], "News")

    def test_agent_directory_is_searchable_and_hides_internal_notes(self):
        agency = Agency.objects.create(company_name="Example Realty")
        Agent.objects.create(
            email="alex@example.com",
            full_name="Alex Morgan",
            agency=agency,
            job_title="Sales Representative",
            location="Toronto",
            internal_notes="Private office note",
        )
        Agent.objects.create(email="sam@example.com", full_name="Sam Lee", location="Ottawa")

        response = self.client.get(reverse("agent-list"), {"search": "Toronto"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual([agent["full_name"] for agent in response.json()], ["Alex Morgan"])
        self.assertEqual(response.json()[0]["agency"]["company_name"], "Example Realty")
        self.assertNotIn("internal_notes", response.json()[0])

    def test_seeded_agent_directory_data_is_available(self):
        april = Agent.objects.get(email="aprilsturko@gmail.com")
        self.assertEqual(april.full_name, "April Sturko")
        self.assertEqual(april.agency.company_name, "Century  21 Masters")
        self.assertEqual(april.license_number, "")

        builders = Agent.objects.filter(job_title__in=[
            "Vice President - Sales",
            "Online Sales Manager",
            "Senior Manager, Data Analytics",
            "Vice President - Finance",
            "Sales Manager",
        ])
        self.assertEqual(builders.count(), 5)

    def test_agent_status_is_limited_to_active_or_inactive(self):
        self.assertEqual(Agent.Status.values, ["Active", "Inactive"])


class AdminContentModelTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username="admin", email="admin@example.com", password="password"
        )
        self.client.force_login(self.user)

    def test_agent_admin_groups_agencies_and_hides_last_active(self):
        mozaic = Agency.objects.get(company_name="Mozaic Realty Group")
        other = Agency.objects.create(company_name="Other Test Realty")
        Agent.objects.create(email="mozaic-test@example.com", full_name="Mozaic Test", agency=mozaic)
        Agent.objects.create(email="other-test@example.com", full_name="Other Test", agency=other)

        response = self.client.get(
            reverse("admin:content_agent_changelist"),
            {"agency_group": "mozaic", "q": "Test"},
        )
        add_response = self.client.get(reverse("admin:content_agent_add"))

        result_names = [agent.full_name for agent in response.context["cl"].result_list]
        self.assertEqual(result_names, ["Mozaic Test"])
        self.assertNotContains(add_response, "Last active")

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
