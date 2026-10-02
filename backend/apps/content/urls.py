from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (AgentViewSet, CalendarEventDetailView, CalendarEventListView,
                    DocumentViewSet, NewsViewSet, PortalSearchView,
                    RequestLoginCodeView, SessionView, VerifyLoginCodeView)

router = DefaultRouter()
router.register("agents", AgentViewSet, basename="agent")
router.register("news", NewsViewSet, basename="news")
router.register("documents", DocumentViewSet, basename="document")
urlpatterns = [
    path("auth/session/", SessionView.as_view(), name="auth-session"),
    path("auth/request-code/", RequestLoginCodeView.as_view(), name="auth-request-code"),
    path("auth/verify-code/", VerifyLoginCodeView.as_view(), name="auth-verify-code"),
    path("search/", PortalSearchView.as_view(), name="portal-search"),
    path("calendar/events/", CalendarEventListView.as_view(), name="calendar-events"),
    path("calendar/events/<path:event_id>/", CalendarEventDetailView.as_view(), name="calendar-event-detail"),
    *router.urls,
]
