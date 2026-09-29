from urllib.parse import quote

from django.db.models import Q
from rest_framework import filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Agent, Document, News
from .serializers import AgentSerializer, DocumentSerializer, NewsSerializer


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
