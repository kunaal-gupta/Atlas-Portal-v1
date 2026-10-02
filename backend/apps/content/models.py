import uuid

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


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


class PortalAccess(models.Model):
    """Controls whether an authentication user may use the portal and at what level."""

    class Role(models.TextChoices):
        READ_ONLY = "read", "Read-only"
        WRITE = "write", "Write access"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="portal_access",
    )
    role = models.CharField(max_length=5, choices=Role.choices, default=Role.READ_ONLY)
    is_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "portal user access"
        verbose_name_plural = "portal user access"

    def __str__(self):
        return f"{self.user.email or self.user.username} ({self.get_role_display()})"

    @property
    def can_write(self):
        return self.is_enabled and self.role == self.Role.WRITE


class LoginCode(models.Model):
    """A short-lived, single-use login code. Only its password hash is stored."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="login_codes")
    code_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField(db_index=True)
    used_at = models.DateTimeField(blank=True, null=True)
    attempts = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def set_code(self, code):
        self.code_hash = make_password(code)

    def matches(self, code):
        return check_password(code, self.code_hash)

    @property
    def is_usable(self):
        return self.used_at is None and self.attempts < 5 and self.expires_at > timezone.now()


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
    updated_date = models.DateTimeField(
        default=timezone.now,
        help_text="The source file's last-modified date when supplied by the uploader.",
    )
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
