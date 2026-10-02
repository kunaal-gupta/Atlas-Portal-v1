from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AgentViewSet, CalendarEventDetailView, CalendarEventListView, DocumentViewSet, NewsViewSet, PortalSearchView

router = DefaultRouter()
router.register("agents", AgentViewSet, basename="agent")
router.register("news", NewsViewSet, basename="news")
router.register("documents", DocumentViewSet, basename="document")
urlpatterns = [
    path("search/", PortalSearchView.as_view(), name="portal-search"),
    path("calendar/events/", CalendarEventListView.as_view(), name="calendar-events"),
    path("calendar/events/<path:event_id>/", CalendarEventDetailView.as_view(), name="calendar-event-detail"),
    *router.urls,
]
