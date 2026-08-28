from django.utils import timezone
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Event, NewsArticle, ResourceCategory
from .serializers import EventSerializer, NewsArticleSerializer, ResourceCategorySerializer


class NewsArticleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NewsArticleSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ("title", "excerpt", "content", "department")

    def get_queryset(self):
        return NewsArticle.objects.filter(is_published=True).select_related("author")

    @action(detail=False)
    def featured(self, request):
        article = self.get_queryset().filter(is_featured=True).first()
        return Response(self.get_serializer(article).data if article else None)


class ResourceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ResourceCategorySerializer
    pagination_class = None
    queryset = ResourceCategory.objects.filter(is_active=True).prefetch_related("resources")


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EventSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ("title", "description", "location")

    def get_queryset(self):
        return Event.objects.filter(is_published=True).select_related("created_by")

    @action(detail=False)
    def upcoming(self, request):
        events = self.filter_queryset(self.get_queryset().filter(end_at__gte=timezone.now()))
        page = self.paginate_queryset(events)
        serializer = self.get_serializer(page if page is not None else events, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

