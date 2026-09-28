from django.contrib import admin
from .models import (
    Agent,
    Document,
    DocumentCategory,
    Event,
    News,
    NewsArticle,
    Resource,
    ResourceCategory,
)


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "professional_role", "location", "status", "last_active")
    list_filter = ("status", "access_role", "professional_role", "location")
    search_fields = ("full_name", "email", "company", "license_number")
    readonly_fields = ("created_at", "updated_at")


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


@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "category_list", "updated_date", "updated_by")
    list_filter = ("categories", "created_date", "updated_date")
    search_fields = ("title", "external_url", "categories__name")
    filter_horizontal = ("categories",)
    readonly_fields = ("created_date", "updated_date", "updated_by")

    @admin.display(description="Pages / categories")
    def category_list(self, obj):
        return ", ".join(obj.categories.values_list("name", flat=True))

    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("title", "published_at", "updated_at")
    list_filter = ("published_at", "created_at", "updated_at")
    search_fields = ("title", "summary", "keywords", "url")
    date_hierarchy = "published_at"
    readonly_fields = ("created_at", "updated_at")


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
