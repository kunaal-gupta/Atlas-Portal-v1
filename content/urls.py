from rest_framework.routers import DefaultRouter
from .views import EventViewSet, NewsArticleViewSet, ResourceCategoryViewSet

router = DefaultRouter()
router.register("news", NewsArticleViewSet, basename="news")
router.register("categories", ResourceCategoryViewSet, basename="categories")
router.register("events", EventViewSet, basename="events")
urlpatterns = router.urls

