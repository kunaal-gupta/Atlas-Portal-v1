import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name="ResourceCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100, unique=True)), ("icon_name", models.CharField(default="FileText", max_length=50)),
                ("color", models.CharField(default="from-slate-600 to-slate-700", max_length=100)), ("order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"verbose_name_plural": "Resource categories", "ordering": ["order", "name"]},
        ),
        migrations.CreateModel(
            name="Resource",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=200)), ("description", models.TextField(blank=True)),
                ("external_url", models.URLField(blank=True)), ("file", models.FileField(blank=True, upload_to="resources/")),
                ("order", models.PositiveIntegerField(default=0)), ("is_active", models.BooleanField(default=True)),
                ("category", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="resources", to="content.resourcecategory")),
            ], options={"ordering": ["order", "title"]},
        ),
        migrations.CreateModel(
            name="NewsArticle",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=255)), ("excerpt", models.TextField(blank=True)), ("content", models.TextField()),
                ("department", models.CharField(db_index=True, max_length=100)), ("image", models.ImageField(blank=True, upload_to="news/")),
                ("image_url", models.URLField(blank=True)), ("published_at", models.DateTimeField(db_index=True)),
                ("views", models.PositiveIntegerField(default=0)), ("is_featured", models.BooleanField(db_index=True, default=False)),
                ("is_published", models.BooleanField(db_index=True, default=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="portal_articles", to=settings.AUTH_USER_MODEL)),
            ], options={"ordering": ["-published_at"]},
        ),
        migrations.CreateModel(
            name="Event",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=200)), ("description", models.TextField(blank=True)),
                ("start_at", models.DateTimeField(db_index=True)), ("end_at", models.DateTimeField()),
                ("location", models.CharField(blank=True, max_length=255)), ("is_published", models.BooleanField(db_index=True, default=True)),
                ("views", models.PositiveIntegerField(default=0)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="portal_events", to=settings.AUTH_USER_MODEL)),
            ], options={"ordering": ["start_at"]},
        ),
    ]

