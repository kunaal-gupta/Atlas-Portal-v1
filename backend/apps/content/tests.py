from django.contrib.auth import get_user_model
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from unittest.mock import patch
from .models import Agent, Agency, Document, DocumentCategory, DocumentFolder, News


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

    def test_documents_endpoint_only_returns_available_files_for_category(self):
        market = DocumentCategory.objects.get(name="Market")
        general = DocumentCategory.objects.get(name="General")
        market_guide = Document.objects.create(
            title="Market guide", external_url="https://example.com/market"
        )
        market_guide.categories.set([market])
        general_guide = Document.objects.create(
            title="General guide", external_url="https://example.com/general"
        )
        general_guide.categories.set([general])
        unavailable = Document.objects.create(title="Unavailable")
        unavailable.categories.set([market])

        response = self.client.get(reverse("document-list"), {"category": "Market"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual([document["title"] for document in response.json()], ["Market guide"])
        self.assertEqual(response.json()[0]["url"], "https://example.com/market")

    def test_documents_endpoint_includes_nested_folder_path(self):
        market = DocumentCategory.objects.get(name="Market")
        guides = DocumentFolder.objects.create(name="Guides")
        buyers = DocumentFolder.objects.create(name="Buyers", parent=guides)
        document = Document.objects.create(
            title="Closing checklist",
            external_url="https://example.com/checklist",
            folder=buyers,
        )
        document.categories.add(market)

        response = self.client.get(reverse("document-list"), {"category": "Market"})

        self.assertEqual(response.json()[0]["folder_path"], ["Guides", "Buyers"])
        self.assertEqual(
            response.json()[0]["folder_ancestors"],
            [{"id": guides.pk, "name": "Guides"}, {"id": buyers.pk, "name": "Buyers"}],
        )

    def test_portal_search_recommends_documents_agents_and_news(self):
        general = DocumentCategory.objects.get(name="General")
        document = Document.objects.create(title="Launch checklist", external_url="https://example.com/checklist")
        document.categories.add(general)
        Agent.objects.create(email="launch@example.com", full_name="Launch Coordinator")
        News.objects.create(title="Launch update", published_at=timezone.now())

        response = self.client.get(reverse("portal-search"), {"q": "launch"})

        self.assertEqual(response.status_code, 200)
        self.assertCountEqual([item["type"] for item in response.json()], ["Document", "Agent", "News"])
        self.assertTrue(all(item["title"] for item in response.json()))

    @patch("apps.content.views.OutlookCalendarClient")
    def test_calendar_reads_events_from_outlook(self, client_class):
        client_class.return_value.list_events.return_value = [{"id": "event-1", "subject": "Training"}]

        response = self.client.get(reverse("calendar-events"), {
            "start": "2026-10-01T00:00:00Z", "end": "2026-11-01T00:00:00Z"
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["events"][0]["subject"], "Training")
        client_class.return_value.list_events.assert_called_once_with(
            "2026-10-01T00:00:00Z", "2026-11-01T00:00:00Z"
        )

    @patch("apps.content.views.OutlookCalendarClient")
    def test_calendar_creates_events_in_outlook(self, client_class):
        client_class.return_value.create_event.return_value = {"id": "event-2", "subject": "Office meeting"}

        response = self.client.post(reverse("calendar-events"), {
            "subject": "Office meeting",
            "start": "2026-10-05T09:00",
            "end": "2026-10-05T10:00",
            "location": "Boardroom",
            "description": "Weekly update",
            "timeZone": "Eastern Standard Time",
            "isAllDay": False,
        }, format="json")

        self.assertEqual(response.status_code, 201)
        payload = client_class.return_value.create_event.call_args.args[0]
        self.assertEqual(payload["location"]["displayName"], "Boardroom")
        self.assertEqual(payload["start"]["timeZone"], "Eastern Standard Time")

    @patch("apps.content.views.OutlookCalendarClient")
    def test_calendar_updates_and_deletes_outlook_events(self, client_class):
        client_class.return_value.update_event.return_value = {"id": "event-3", "subject": "Updated"}
        payload = {
            "subject": "Updated", "start": "2026-10-06T13:00", "end": "2026-10-06T14:00",
            "timeZone": "Eastern Standard Time", "isAllDay": False,
        }

        update = self.client.patch(reverse("calendar-event-detail", args=["event-3"]), payload, format="json")
        delete = self.client.delete(reverse("calendar-event-detail", args=["event-3"]))

        self.assertEqual(update.status_code, 200)
        self.assertEqual(delete.status_code, 204)
        client_class.return_value.update_event.assert_called_once()
        client_class.return_value.delete_event.assert_called_once_with("event-3")

    def test_calendar_requires_a_date_range(self):
        response = self.client.get(reverse("calendar-events"))
        self.assertEqual(response.status_code, 400)


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
        add_page = self.client.get(reverse("admin:content_document_add"))
        response = self.client.post(
            reverse("admin:content_document_add"),
            {
                "title": "Agent handbook",
                "external_url": "https://example.com/handbook",
                "categories": [category.pk],
                "source_modified_at": "2023-08-09T14:20:00Z",
                "_save": "Save",
            },
        )

        self.assertContains(add_page, 'id="id_source_modified_at"', html=False)
        self.assertContains(add_page, "content/document_modified_date.js")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Document.objects.get().updated_by, self.user)
        self.assertEqual(Document.objects.get().updated_date.isoformat(), "2023-08-09T14:20:00+00:00")

    def test_admin_can_import_a_folder_and_preserve_nested_paths(self):
        category = DocumentCategory.objects.get(name="General")
        response = self.client.post(
            reverse("admin:content_document_import_folder"),
            {
                "categories": [category.pk],
                "files": [
                    SimpleUploadedFile("welcome.pdf", b"welcome"),
                    SimpleUploadedFile("contacts.txt", b"contacts"),
                    SimpleUploadedFile("logo.svg", b"logo"),
                ],
                "relative_paths": [
                    "Starter kit/welcome.pdf",
                    "Starter kit/Reference/contacts.txt",
                    "Brand assets/Logos/logo.svg",
                ],
                "modified_dates": [
                    "2024-01-02T10:30:00Z",
                    "2024-02-03T11:45:00Z",
                    "2024-03-04T12:15:00Z",
                ],
                "folder_paths": [
                    "Starter kit",
                    "Starter kit/Reference",
                    "Brand assets",
                    "Brand assets/Logos",
                    "Brand assets/Empty folder",
                ],
            },
        )

        self.assertRedirects(response, reverse("admin:content_document_changelist"))
        self.assertEqual(Document.objects.get(title="welcome").folder.path, "Starter kit")
        self.assertEqual(Document.objects.get(title="contacts").folder.path, "Starter kit / Reference")
        self.assertEqual(Document.objects.get(title="logo").folder.path, "Brand assets / Logos")
        self.assertEqual(Document.objects.get(title="logo").updated_date.isoformat(), "2024-03-04T12:15:00+00:00")
        self.assertTrue(DocumentFolder.objects.filter(name="Empty folder", parent__name="Brand assets").exists())
        self.assertEqual(Document.objects.get(title="contacts").updated_by, self.user)
        self.assertEqual(Document.objects.get(title="contacts").categories.get(), category)

    def test_admin_folder_manifest_preserves_empty_nested_folders(self):
        category = DocumentCategory.objects.get(name="General")
        response = self.client.post(
            reverse("admin:content_document_import_folder"),
            {
                "categories": [category.pk],
                "folder_paths": ["Campaigns", "Campaigns/Coming soon"],
            },
        )

        self.assertRedirects(response, reverse("admin:content_document_changelist"))
        folder = DocumentFolder.objects.get(name="Coming soon")
        self.assertEqual(folder.parent.name, "Campaigns")

    def test_news_stores_admin_managed_metadata(self):
        article = News.objects.create(
            title="Office update",
            url="https://example.com/news",
            summary="The latest office news.",
            published_at=timezone.now(),
            keywords="office, update",
        )

        self.assertEqual(article.keywords, "office, update")
