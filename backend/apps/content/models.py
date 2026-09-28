from django.conf import settings
from django.db import models


class Agent(models.Model):
    """A directory profile for an Atlas agent.

    This intentionally lives separately from Django's authentication user so
    directory records can be imported from the brokerage's user system without
    granting portal access.
    """

    userid = models.CharField(max_length=255, primary_key=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=255, blank=True)
    access_role = models.CharField(max_length=100)
    professional_role = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=50, default="Active", db_index=True)
    job_title = models.CharField(max_length=150, blank=True)
    location = models.CharField(max_length=255, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    license_expiry = models.DateField(blank=True, null=True)
    profile_photo = models.URLField(blank=True)
    internal_notes = models.CharField(max_length=500, blank=True)
    last_active = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    company_banner = models.URLField(blank=True)

    class Meta:
        ordering = ["full_name"]
        db_table = "users"

    def __str__(self):
        return self.full_name


class DocumentCategory(models.Model):
    """A portal page or audience where a document can be displayed."""

    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Document categories"

    def __str__(self):
        return self.name


class Document(models.Model):
    title = models.CharField(max_length=255)
    document_upload = models.FileField(upload_to="documents/", blank=True)
    external_url = models.URLField(blank=True)
    categories = models.ManyToManyField(
        DocumentCategory,
        related_name="documents",
        help_text="Select every portal page where this document should be shown.",
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="updated_documents",
    )

    class Meta:
        ordering = ["-updated_date", "title"]

    def __str__(self):
        return self.title


class News(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField(blank=True)
    summary = models.TextField(blank=True)
    published_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    keywords = models.CharField(
        max_length=500,
        blank=True,
        help_text="Enter comma-separated keywords.",
    )

    class Meta:
        ordering = ["-published_at"]
        verbose_name_plural = "News"

    def __str__(self):
        return self.title
