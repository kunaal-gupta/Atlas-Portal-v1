from urllib.parse import urlsplit

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WorkspaceEntry, TrainingProgress, SupportRequest, SupportUpdate
from .permissions import HasPortalAccess


class EntryInput(serializers.Serializer):
    url = serializers.CharField(max_length=2000)
    title = serializers.CharField(max_length=255)
    kind = serializers.ChoiceField(choices=['page', 'file'])
    saved = serializers.BooleanField(required=False)

    def validate_url(self, value):
        try:
            parsed = urlsplit(value)
        except ValueError as error:
            raise serializers.ValidationError('Enter a valid URL.') from error
        if any(ord(char) < 32 for char in value):
            raise serializers.ValidationError('Enter a valid URL.')
        if value.startswith('/') and not value.startswith('//') and not parsed.netloc and '\\' not in value:
            return value
        if parsed.scheme not in ['http', 'https'] or not parsed.netloc or parsed.username or parsed.password or '\\' in value:
            raise serializers.ValidationError('Use a local path or an HTTP/HTTPS URL.')
        serializers.URLField(max_length=2000).run_validation(value)
        return value


class EntryOutput(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceEntry
        fields = ['id', 'url', 'title', 'kind', 'saved', 'accessed_at']


class WorkspaceView(APIView):
    permission_classes = [HasPortalAccess]

    def get(self, request):
        entries = WorkspaceEntry.objects.filter(user=request.user)
        return Response({
            'saved': EntryOutput(entries.filter(saved=True).order_by('title'), many=True).data,
            'recent': EntryOutput(entries.filter(accessed_at__isnull=False).order_by('-accessed_at')[:5], many=True).data,
            'training': list(TrainingProgress.objects.filter(user=request.user).values('course', 'completed', 'updated_at')),
        })

    def post(self, request):
        serializer = EntryInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        defaults = {'title': data['title'], 'kind': data['kind']}
        if 'saved' in data:
            defaults['saved'] = data['saved']
        else:
            defaults['accessed_at'] = timezone.now()
        entry, _ = WorkspaceEntry.objects.update_or_create(user=request.user, url=data['url'], defaults=defaults)
        return Response(EntryOutput(entry).data)


class TrainingView(APIView):
    permission_classes = [HasPortalAccess]

    def post(self, request):
        class Input(serializers.Serializer):
            course = serializers.ChoiceField(choices=TrainingProgress._meta.get_field('course').choices)
            completed = serializers.BooleanField()
        serializer = Input(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        entry, _ = TrainingProgress.objects.update_or_create(user=request.user, course=data['course'], defaults={'completed': data['completed']})
        return Response({'course': entry.course, 'completed': entry.completed})


class RequestInput(serializers.ModelSerializer):
    class Meta:
        model = SupportRequest
        fields = ['department', 'subject', 'description']


class RequestOutput(serializers.ModelSerializer):
    requester = serializers.CharField(source='requester.email')

    class Meta:
        model = SupportRequest
        fields = ['id', 'requester', 'department', 'subject', 'description', 'status', 'created_at', 'updated_at']


class UpdateOutput(serializers.ModelSerializer):
    author = serializers.CharField(source='author.email')

    class Meta:
        model = SupportUpdate
        fields = ['id', 'author', 'message', 'status', 'created_at']


def visible_requests(user):
    items = SupportRequest.objects.select_related('requester')
    return items if user.is_superuser else items.filter(requester=user)


class SupportListView(APIView):
    permission_classes = [HasPortalAccess]

    def get(self, request):
        items = visible_requests(request.user)
        for field in ['department', 'status']:
            if request.query_params.get(field):
                items = items.filter(**{field: request.query_params[field]})
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        return paginator.get_paginated_response(RequestOutput(paginator.paginate_queryset(items, request), many=True).data)

    def post(self, request):
        serializer = RequestInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save(requester=request.user)
        return Response(RequestOutput(ticket).data, status=201)


class SupportDetailView(APIView):
    permission_classes = [HasPortalAccess]

    def get(self, request, pk):
        ticket = get_object_or_404(visible_requests(request.user), pk=pk)
        return Response({**RequestOutput(ticket).data, 'updates': UpdateOutput(ticket.updates.select_related('author'), many=True).data})

    @transaction.atomic
    def post(self, request, pk):
        ticket = get_object_or_404(visible_requests(request.user).select_for_update(), pk=pk)
        class Input(serializers.Serializer):
            message = serializers.CharField(max_length=5000, required=False, allow_blank=True, default='')
            status = serializers.ChoiceField(choices=SupportRequest.Status.choices, required=False)
        serializer = Input(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if 'status' in data and not request.user.is_superuser:
            return Response({'detail': 'Only support administrators can change status.'}, status=403)
        if not data['message'] and ('status' not in data or data['status'] == ticket.status):
            return Response({'detail': 'Add a message or change the status.'}, status=400)
        ticket.status = data.get('status', ticket.status)
        ticket.save(update_fields=['status', 'updated_at'])
        SupportUpdate.objects.create(request=ticket, author=request.user, message=data['message'], status=ticket.status)
        return Response({**RequestOutput(ticket).data, 'updates': UpdateOutput(ticket.updates.select_related('author'), many=True).data})
