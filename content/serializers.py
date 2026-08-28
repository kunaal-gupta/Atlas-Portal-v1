from rest_framework import serializers
from .models import Event, NewsArticle, Resource, ResourceCategory


class NewsArticleSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.get_full_name", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsArticle
        fields = ("id", "title", "excerpt", "content", "author", "department", "published_at", "views", "image_url", "is_featured")

    def get_image_url(self, obj):
        url = obj.image.url if obj.image else obj.image_url
        return self.context["request"].build_absolute_uri(url) if url and url.startswith("/") else url


class ResourceSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = ("id", "title", "description", "url", "order")

    def get_url(self, obj):
        url = obj.file.url if obj.file else obj.external_url
        return self.context["request"].build_absolute_uri(url) if url and url.startswith("/") else url


class ResourceCategorySerializer(serializers.ModelSerializer):
    resources = serializers.SerializerMethodField()

    class Meta:
        model = ResourceCategory
        fields = ("id", "name", "icon_name", "color", "order", "resources")

    def get_resources(self, obj):
        return ResourceSerializer(obj.resources.filter(is_active=True), many=True, context=self.context).data


class EventSerializer(serializers.ModelSerializer):
    created_by = serializers.CharField(source="created_by.get_full_name", read_only=True)

    class Meta:
        model = Event
        fields = ("id", "title", "description", "start_at", "end_at", "location", "created_by", "views")

