from django.db import migrations


CATEGORY_NAMES = (
    "Market",
    "Agent",
    "Firm",
    "New Agent",
    "New Construction",
    "On-Going",
    "Trade Partners",
    "Condo",
    "General",
    "Tips",
    "News & Events",
    "Calendar",
    "Logos",
    "Brand Book Summary",
    "Templates",
    "Canva Link",
    "HoodQ",
    "Schools, Shopping, Hospitals",
    "Brokerage Manual",
    "FINTRAC",
    "Other",
)


def seed_document_categories(apps, schema_editor):
    DocumentCategory = apps.get_model("content", "DocumentCategory")
    DocumentCategory.objects.bulk_create(
        [DocumentCategory(name=name) for name in CATEGORY_NAMES],
        ignore_conflicts=True,
    )


def remove_document_categories(apps, schema_editor):
    DocumentCategory = apps.get_model("content", "DocumentCategory")
    DocumentCategory.objects.filter(name__in=CATEGORY_NAMES).delete()


class Migration(migrations.Migration):
    dependencies = [("content", "0004_documentcategory_news_document")]

    operations = [
        migrations.RunPython(seed_document_categories, remove_document_categories),
    ]
