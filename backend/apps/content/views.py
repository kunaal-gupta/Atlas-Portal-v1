from django.db.models import Q
from rest_framework import filters, viewsets
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
