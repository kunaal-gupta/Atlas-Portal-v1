from rest_framework import serializers
from .models import Agent, Agency, News


class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ("agency_id", "company_name", "company_logo", "email", "website", "company_phone")


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
