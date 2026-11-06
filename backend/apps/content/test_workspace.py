from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from .models import PortalAccess, SupportRequest, SupportUpdate, WorkspaceEntry, TrainingProgress


class WorkspaceAndSupportTests(TestCase):
    def setUp(self):
        self.agent = get_user_model().objects.create_user(username='agent', email='agent@example.com')
        self.other = get_user_model().objects.create_user(username='other', email='other@example.com')
        self.admin = get_user_model().objects.create_superuser(username='admin', email='admin@example.com', password='test-admin')
        PortalAccess.objects.create(user=self.agent, role='read')
        PortalAccess.objects.create(user=self.other, role='write')
        self.client = APIClient()
        self.client.force_authenticate(self.agent)

    def create_ticket(self):
        response = self.client.post('/api/support/', {'department': 'it', 'subject': 'Cannot access tools', 'description': 'Please check my access.', 'requester': self.other.pk, 'status': 'resolved'}, format='json')
        self.assertEqual(response.status_code, 201)
        return response.json()['id']

    def test_read_only_agent_can_submit_but_cannot_spoof_owner_or_status(self):
        ticket = SupportRequest.objects.get(pk=self.create_ticket())
        self.assertEqual(ticket.requester, self.agent)
        self.assertEqual(ticket.status, 'open')

    def test_other_agents_cannot_read_or_update_requests_even_with_write_access(self):
        pk = self.create_ticket()
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get('/api/support/').json()['count'], 0)
        self.assertEqual(self.client.get(f'/api/support/{pk}/').status_code, 404)
        self.assertEqual(self.client.post(f'/api/support/{pk}/', {'message': 'not mine'}, format='json').status_code, 404)

    def test_agent_followup_and_admin_status_updates_are_recorded(self):
        pk = self.create_ticket()
        self.assertEqual(self.client.post(f'/api/support/{pk}/', {'message': 'Adding context'}, format='json').status_code, 200)
        self.assertEqual(self.client.post(f'/api/support/{pk}/', {'status': 'resolved'}, format='json').status_code, 403)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.get('/api/support/?department=it&status=open').json()['count'], 1)
        response = self.client.post(f'/api/support/{pk}/', {'status': 'in_progress', 'message': 'Investigating'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'in_progress')
        self.assertEqual(len(response.json()['updates']), 2)
        self.assertEqual(response.json()['updates'][1]['author'], 'admin@example.com')
        self.client.force_authenticate(self.agent)
        self.assertEqual(self.client.get(f'/api/support/{pk}/').json()['status'], 'in_progress')

    def test_invalid_or_empty_request_and_update_are_rejected(self):
        for payload in [{'department': 'legal', 'subject': 'Help', 'description': 'Help'}, {'department': 'it', 'subject': ' ', 'description': 'Help'}, {'department': 'it', 'subject': 'Help', 'description': 'x' * 5001}]:
            self.assertEqual(self.client.post('/api/support/', payload, format='json').status_code, 400)
        pk = self.create_ticket()
        self.assertEqual(self.client.post(f'/api/support/{pk}/', {}, format='json').status_code, 400)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post(f'/api/support/{pk}/', {'status': 'invalid'}, format='json').status_code, 400)
        self.assertEqual(SupportUpdate.objects.count(), 0)

    def test_disabled_and_anonymous_users_cannot_access_workspace_or_support(self):
        for path in ['/api/workspace/', '/api/workspace/training/', '/api/support/']:
            self.client.force_authenticate(None)
            self.assertIn(self.client.get(path).status_code, [401, 403])
            self.client.force_authenticate(self.agent)
            PortalAccess.objects.filter(user=self.agent).update(is_enabled=False)
            self.agent.refresh_from_db()
            self.assertEqual(self.client.post(path, {}, format='json').status_code, 403)

    def test_saved_resources_and_training_are_isolated_per_account(self):
        self.assertEqual(self.client.post('/api/workspace/', {'url': '/training/new-agent/', 'title': 'Training', 'kind': 'page', 'saved': True, 'user': self.other.pk}, format='json').status_code, 200)
        self.assertEqual(self.client.post('/api/workspace/training/', {'course': 'new-agent', 'completed': True}, format='json').status_code, 200)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get('/api/workspace/').json(), {'saved': [], 'recent': [], 'training': []})
        self.assertEqual(WorkspaceEntry.objects.get().user, self.agent)
        self.assertEqual(TrainingProgress.objects.get().user, self.agent)

    def test_visits_do_not_unsave_and_recent_list_is_bounded(self):
        payload = {'url': '/resources/general/', 'title': 'Forms', 'kind': 'page'}
        self.client.post('/api/workspace/', {**payload, 'saved': True}, format='json')
        self.client.post('/api/workspace/', payload, format='json')
        for i in range(7):
            self.client.post('/api/workspace/', {**payload, 'url': f'/page/{i}/'}, format='json')
        data = self.client.get('/api/workspace/').json()
        self.assertEqual(len(data['recent']), 5)
        self.assertEqual(len(data['saved']), 1)
        self.client.post('/api/workspace/', {**payload, 'saved': False}, format='json')
        self.assertEqual(self.client.get('/api/workspace/').json()['saved'], [])

    def test_unsafe_bookmarks_and_unknown_training_are_rejected(self):
        for url in ['https://[broken', 'https://', 'javascript:alert(1)', '//evil.example', 'https://user:pass@example.com', '/\\evil.example']:
            self.assertEqual(self.client.post('/api/workspace/', {'url': url, 'title': 'Bad', 'kind': 'page', 'saved': True}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/workspace/training/', {'course': 'compliance-certified', 'completed': True}, format='json').status_code, 400)

    def test_pagination_and_filtering(self):
        SupportRequest.objects.bulk_create([SupportRequest(requester=self.agent, department='marketing', subject=f'Request {i}', description='Help') for i in range(21)])
        response = self.client.get('/api/support/').json()
        self.assertEqual(response['count'], 21)
        self.assertEqual(len(response['results']), 20)
        self.assertTrue(response['next'])
        self.assertEqual(len(self.client.get('/api/support/?page=2').json()['results']), 1)
        self.assertEqual(self.client.get('/api/support/?department=it').json()['count'], 0)
