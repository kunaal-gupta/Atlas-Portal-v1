from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class NewsArticle(TimeStampedModel):
    title = models.CharField(max_length=255)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="portal_articles")
    department = models.CharField(max_length=100, db_index=True)
    image = models.ImageField(upload_to="news/", blank=True)
    image_url = models.URLField(blank=True)
    published_at = models.DateTimeField(db_index=True)
    views = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_published = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return self.title


class ResourceCategory(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    icon_name = models.CharField(max_length=50, default="FileText")
    color = models.CharField(max_length=100, default="from-slate-600 to-slate-700")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Resource categories"

    def __str__(self):
        return self.name


class Resource(TimeStampedModel):
    category = models.ForeignKey(ResourceCategory, on_delete=models.CASCADE, related_name="resources")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    external_url = models.URLField(blank=True)
    file = models.FileField(upload_to="resources/", blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        return self.title


class Event(TimeStampedModel):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_at = models.DateTimeField(db_index=True)
    end_at = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="portal_events")
    is_published = models.BooleanField(default=True, db_index=True)
    views = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["start_at"]

    def __str__(self):
        return self.title

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_at <= self.start_at:
            raise ValidationError({"end_at": "End time must be after start time."})

