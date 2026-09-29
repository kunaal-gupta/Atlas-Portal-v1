from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AgentViewSet, DocumentViewSet, NewsViewSet, PortalSearchView

router = DefaultRouter()
router.register("agents", AgentViewSet, basename="agent")
router.register("news", NewsViewSet, basename="news")
router.register("documents", DocumentViewSet, basename="document")
urlpatterns = [path("search/", PortalSearchView.as_view(), name="portal-search"), *router.urls]
