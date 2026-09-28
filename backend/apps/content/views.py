from rest_framework import filters, viewsets
from .models import Agent, News
from .serializers import AgentSerializer, NewsSerializer


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
