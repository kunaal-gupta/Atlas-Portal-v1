import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Agency(models.Model):
    agency_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255)
    company_logo = models.ImageField(upload_to="agencies/logos/", blank=True)
    company_banner = models.ImageField(upload_to="agencies/banners/", blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    company_phone = models.CharField(max_length=50, blank=True)
    internal_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "agencies"
        ordering = ["company_name"]
        verbose_name_plural = "Agencies"

    def __str__(self):
        return self.company_name


class Agent(models.Model):
    """A directory profile for an Atlas agent.

    This intentionally lives separately from Django's authentication user so
    directory records can be imported from the brokerage's user system without
    granting portal access.
    """

    class Status(models.TextChoices):
        ACTIVE = "Active", "Active"
        INACTIVE = "Inactive", "Inactive"

    userid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=50, blank=True)
    agency = models.ForeignKey(
        Agency,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="agents",
    )
    status = models.CharField(max_length=8, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    job_title = models.CharField(max_length=150, blank=True)
    location = models.CharField(max_length=255, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    license_expiry = models.DateField(blank=True, null=True)
    profile_photo = models.ImageField(upload_to="agents/profiles/", blank=True)
    internal_notes = models.CharField(max_length=500, blank=True)
    last_active = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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


class DocumentFolder(models.Model):
    """A folder in the document library; folders may be nested without a depth limit."""

    name = models.CharField(max_length=255)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="children",
    )

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=("parent", "name"),
                condition=models.Q(parent__isnull=False),
                name="unique_document_folder_name_per_parent",
            ),
            models.UniqueConstraint(
                fields=("name",),
                condition=models.Q(parent__isnull=True),
                name="unique_root_document_folder_name",
            ),
        ]

    def __str__(self):
        return self.path

    @property
    def path(self):
        parts = [self.name]
        parent = self.parent
        while parent:
            parts.append(parent.name)
            parent = parent.parent
        return " / ".join(reversed(parts))

    def clean(self):
        super().clean()
        parent = self.parent
        while parent:
            if parent.pk == self.pk:
                raise ValidationError({"parent": "A folder cannot be inside itself."})
            parent = parent.parent


class Document(models.Model):
    title = models.CharField(max_length=255)
    document_upload = models.FileField(upload_to="documents/", blank=True)
    external_url = models.URLField(blank=True)
    folder = models.ForeignKey(
        DocumentFolder,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="documents",
        help_text="Optional folder used to organize this file in the portal.",
    )
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
