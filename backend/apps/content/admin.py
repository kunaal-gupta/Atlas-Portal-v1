from django.contrib import admin
from .models import (
    Agent,
    Agency,
    Document,
    DocumentCategory,
    News,
)


class AgencyGroupFilter(admin.SimpleListFilter):
    title = "agency group"
    parameter_name = "agency_group"

    def lookups(self, request, model_admin):
        return (
            ("mozaic", "Mozaic Realty Group"),
            ("other", "Other agencies"),
        )

    def queryset(self, request, queryset):
        if self.value() == "mozaic":
            return queryset.filter(agency__company_name__iexact="Mozaic Realty Group")
        if self.value() == "other":
            return queryset.exclude(agency__company_name__iexact="Mozaic Realty Group")
        return queryset


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "agency", "job_title", "location", "status")
    list_filter = (AgencyGroupFilter, "status", "agency", "location")
    search_fields = ("full_name", "email", "agency__company_name", "license_number")
    readonly_fields = ("created_at", "updated_at")
    exclude = ("last_active",)


@admin.register(Agency)
class AgencyAdmin(admin.ModelAdmin):
    list_display = ("company_name", "email", "company_phone", "website", "updated_at")
    search_fields = ("company_name", "email", "company_phone")
    readonly_fields = ("created_at", "updated_at")


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


admin.site.site_header = "Atlas Administration"
admin.site.site_title = "Atlas Admin"
admin.site.index_title = "Content management"
