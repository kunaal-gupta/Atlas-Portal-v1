from datetime import datetime, timedelta
from urllib.parse import quote

from django.conf import settings
from django.db.models import Q
from rest_framework import filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Agent, Document, News
from .outlook import OutlookApiError, OutlookCalendarClient, OutlookConfigurationError
from .serializers import AgentSerializer, DocumentSerializer, NewsSerializer


def calendar_error_response(error):
    if isinstance(error, OutlookConfigurationError):
        return Response({"detail": str(error), "code": "not_configured"}, status=503)
    return Response({"detail": str(error), "code": "outlook_error"}, status=error.status)


def calendar_event_payload(data):
    required = ("subject", "start", "end")
    if any(not data.get(field) for field in required):
        raise ValueError("Subject, start, and end are required.")
    timezone_name = data.get("timeZone") or "Eastern Standard Time"
    try:
        start_value = datetime.fromisoformat(str(data["start"]).replace("Z", "+00:00"))
        end_value = datetime.fromisoformat(str(data["end"]).replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError("Start and end must be valid ISO dates.") from error
    if end_value <= start_value:
        raise ValueError("End must be later than start.")
    is_all_day = bool(data.get("isAllDay", False))
    if is_all_day:
        start_day = start_value.date()
        end_day = max(end_value.date(), start_day + timedelta(days=1))
        start_text = f"{start_day.isoformat()}T00:00:00"
        end_text = f"{end_day.isoformat()}T00:00:00"
    else:
        start_text, end_text = str(data["start"]), str(data["end"])
    payload = {
        "subject": str(data["subject"]).strip()[:255],
        "start": {"dateTime": start_text, "timeZone": timezone_name},
        "end": {"dateTime": end_text, "timeZone": timezone_name},
        "isAllDay": is_all_day,
        "location": {"displayName": str(data.get("location", "")).strip()[:255]},
        "body": {"contentType": "text", "content": str(data.get("description", "")).strip()},
    }
    if not payload["subject"]:
        raise ValueError("Subject is required.")
    return payload


class CalendarEventListView(APIView):
    """Read and create events in the configured Outlook shared calendar."""

    def get(self, request):
        start, end = request.query_params.get("start"), request.query_params.get("end")
        if not start or not end:
            return Response({"detail": "A start and end range is required."}, status=400)
        try:
            events = OutlookCalendarClient().list_events(start, end)
            return Response({"events": events, "mailbox": settings.OUTLOOK_CALENDAR_MAILBOX})
        except (OutlookConfigurationError, OutlookApiError) as error:
            return calendar_error_response(error)

    def post(self, request):
        try:
            event = OutlookCalendarClient().create_event(calendar_event_payload(request.data))
            return Response(event, status=201)
        except ValueError as error:
            return Response({"detail": str(error)}, status=400)
        except (OutlookConfigurationError, OutlookApiError) as error:
            return calendar_error_response(error)


class CalendarEventDetailView(APIView):
    def patch(self, request, event_id):
        try:
            event = OutlookCalendarClient().update_event(event_id, calendar_event_payload(request.data))
            return Response(event)
        except ValueError as error:
            return Response({"detail": str(error)}, status=400)
        except (OutlookConfigurationError, OutlookApiError) as error:
            return calendar_error_response(error)

    def delete(self, request, event_id):
        try:
            OutlookCalendarClient().delete_event(event_id)
            return Response(status=204)
        except (OutlookConfigurationError, OutlookApiError) as error:
            return calendar_error_response(error)


class AgentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AgentSerializer
    pagination_class = None
    filter_backends = (filters.SearchFilter,)
    search_fields = ("full_name", "email", "agency__company_name", "job_title", "location")
    queryset = Agent.objects.select_related("agency")


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NewsSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ("title", "summary", "keywords")
    queryset = News.objects.all()


class DocumentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DocumentSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Document.objects.filter(
            ~Q(document_upload="") | ~Q(external_url="")
        )
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(categories__name__iexact=category)
        return queryset.select_related("folder", "folder__parent").distinct()


class PortalSearchView(APIView):
    """Return lightweight recommendations across searchable portal content."""

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response([])

        documents = Document.objects.filter(
            Q(title__icontains=query)
            | Q(folder__name__icontains=query)
            | Q(categories__name__icontains=query)
            | Q(external_url__icontains=query),
        ).filter(~Q(document_upload="") | ~Q(external_url="")).select_related("folder").distinct()[:6]
        agents = Agent.objects.filter(
            Q(full_name__icontains=query)
            | Q(email__icontains=query)
            | Q(job_title__icontains=query)
            | Q(location__icontains=query)
            | Q(agency__company_name__icontains=query)
        ).select_related("agency")[:6]
        news_items = News.objects.filter(
            Q(title__icontains=query) | Q(summary__icontains=query) | Q(keywords__icontains=query)
        )[:6]

        results = [
            {
                "type": "Document",
                "title": document.title,
                "subtitle": document.folder.path if document.folder else "Document library",
                "url": request.build_absolute_uri(document.document_upload.url) if document.document_upload else document.external_url,
            }
            for document in documents
        ]
        results.extend(
            {
                "type": "Agent",
                "title": agent.full_name,
                "subtitle": agent.agency.company_name if agent.agency else agent.email,
                "url": f"/the-numbers/agent/?search={quote(query, safe='')}",
            }
            for agent in agents
        )
        results.extend(
            {
                "type": "News",
                "title": item.title,
                "subtitle": item.summary[:100] or "News & events",
                "url": item.url or "/resources/news-and-events/",
            }
            for item in news_items
        )
        return Response(results[:12])
