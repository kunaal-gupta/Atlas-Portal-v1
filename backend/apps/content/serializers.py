from rest_framework import serializers
from .models import Agent, Agency, Document, News


class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = (
            "agency_id", "company_name", "company_logo", "company_banner",
            "email", "website", "company_phone",
        )


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = (
            "userid", "email", "full_name", "phone_number", "agency",
            "status", "job_title",
            "location", "license_number", "license_expiry", "profile_photo",
            "last_active",
        )

    agency = AgencySerializer(read_only=True)


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ("id", "title", "url", "summary", "published_at", "keywords")


class DocumentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    folder_path = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ("id", "title", "url", "folder_path", "updated_date")

    def get_url(self, document):
        if document.document_upload:
            return self.context["request"].build_absolute_uri(document.document_upload.url)
        return document.external_url

    def get_folder_path(self, document):
        path = []
        folder = document.folder
        while folder:
            path.append(folder.name)
            folder = folder.parent
        return list(reversed(path))
