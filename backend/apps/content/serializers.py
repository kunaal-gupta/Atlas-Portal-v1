from rest_framework import serializers
from .models import Agent, News


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = (
            "userid", "email", "full_name", "phone_number", "company",
            "access_role", "professional_role", "status", "job_title",
            "location", "license_number", "license_expiry", "profile_photo",
            "last_active", "company_banner",
        )


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ("id", "title", "url", "summary", "published_at", "keywords")
