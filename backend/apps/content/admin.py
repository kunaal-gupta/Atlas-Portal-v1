from pathlib import PurePosixPath

from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import redirect, render
from django.urls import path

from .forms import FolderImportForm
from .models import (
    Agent,
    Agency,
    Document,
    DocumentCategory,
    DocumentFolder,
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


@admin.register(DocumentFolder)
class DocumentFolderAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "path_display")
    list_filter = ("parent",)
    search_fields = ("name", "parent__name")

    @admin.display(description="Full path")
    def path_display(self, obj):
        return obj.path


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    change_list_template = "admin/content/document/change_list.html"
    list_display = ("title", "folder", "category_list", "updated_date", "updated_by")
    list_filter = ("folder", "categories", "created_date", "updated_date")
    search_fields = ("title", "folder__name", "external_url", "categories__name")
    filter_horizontal = ("categories",)
    readonly_fields = ("created_date", "updated_date", "updated_by")

    @admin.display(description="Pages / categories")
    def category_list(self, obj):
        return ", ".join(obj.categories.values_list("name", flat=True))

    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

    def get_urls(self):
        return [
            path(
                "import-folder/",
                self.admin_site.admin_view(self.import_folder),
                name="content_document_import_folder",
            ),
        ] + super().get_urls()

    def import_folder(self, request):
        if not self.has_add_permission(request):
            raise PermissionDenied

        form = FolderImportForm(request.POST or None)
        if request.method == "POST" and form.is_valid():
            files = request.FILES.getlist("files")
            relative_paths = request.POST.getlist("relative_paths")
            if not files:
                form.add_error(None, "Choose a folder containing at least one file.")
            elif len(files) != len(relative_paths):
                form.add_error(None, "The selected folder could not be read. Please select it again.")
            else:
                with transaction.atomic():
                    imported = self._import_files(
                        files,
                        relative_paths,
                        form.cleaned_data["parent"],
                        form.cleaned_data["categories"],
                        request.user,
                    )
                self.message_user(request, f"Imported {imported} files.", messages.SUCCESS)
                return redirect("admin:content_document_changelist")

        context = {
            **self.admin_site.each_context(request),
            "opts": self.model._meta,
            "title": "Import a folder",
            "form": form,
        }
        return render(request, "admin/content/document/import_folder.html", context)

    @staticmethod
    def _import_files(files, relative_paths, parent, categories, user):
        folder_cache = {}
        imported = 0
        for uploaded_file, raw_path in zip(files, relative_paths):
            relative_path = PurePosixPath(raw_path.replace("\\", "/"))
            if relative_path.is_absolute() or ".." in relative_path.parts:
                continue
            current = parent
            for folder_name in relative_path.parts[:-1]:
                key = (current.pk if current else None, folder_name)
                folder = folder_cache.get(key)
                if folder is None:
                    folder, _ = DocumentFolder.objects.get_or_create(parent=current, name=folder_name)
                    folder_cache[key] = folder
                current = folder
            document = Document.objects.create(
                title=relative_path.stem,
                document_upload=uploaded_file,
                folder=current,
                updated_by=user,
            )
            document.categories.set(categories)
            imported += 1
        return imported


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
