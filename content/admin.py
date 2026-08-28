from django.contrib import admin
from .models import Event, NewsArticle, Resource, ResourceCategory


@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "department", "author", "published_at", "is_featured", "is_published")
    list_filter = ("department", "is_featured", "is_published", "published_at")
    search_fields = ("title", "excerpt", "content", "author__username")
    date_hierarchy = "published_at"
    autocomplete_fields = ("author",)
    readonly_fields = ("views", "created_at", "updated_at")


class ResourceInline(admin.TabularInline):
    model = Resource
    extra = 0


@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "icon_name", "order", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("name",)
    inlines = (ResourceInline,)


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "order", "is_active", "updated_at")
    list_filter = ("category", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("title", "description")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "start_at", "end_at", "location", "is_published")
    list_filter = ("is_published", "start_at")
    search_fields = ("title", "description", "location")
    date_hierarchy = "start_at"
    autocomplete_fields = ("created_by",)
    readonly_fields = ("views", "created_at", "updated_at")


admin.site.site_header = "Atlas Administration"
admin.site.site_title = "Atlas Admin"
admin.site.index_title = "Content management"
