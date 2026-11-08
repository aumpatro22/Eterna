from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from memorials.models import Memorial

User = get_user_model()

class MemorialCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.url = reverse('api_memorial_create')

    def test_memorial_create_unauthenticated(self):
        response = self.client.post(self.url, {'full_name': 'Test Name'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_memorial_create_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'full_name': 'Test Memorial'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Memorial.objects.filter(full_name='Test Memorial', owner=self.user).exists())

    def test_memorial_create_free_tier_limit(self):
        # Create one memorial first
        Memorial.objects.create(owner=self.user, full_name='First Memorial')

        # Try to create a second one
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'full_name': 'Second Memorial'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Free tier users are limited to 1 memorial.')

    def test_memorial_create_missing_fields(self):
        self.client.force_authenticate(user=self.user)
        # full_name is required in serializer
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('full_name', response.data)


class MemorialRateLimitTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.memorial = Memorial.objects.create(owner=self.user, full_name='Test Memorial', visibility='PUBLIC')

    def tearDown(self):
        from django.core.cache import cache
        cache.clear()

    def test_add_message_rate_limit(self):
        from django.core.cache import cache
        cache.clear()

        url = reverse('api_memorial_message', kwargs={'pk': self.memorial.pk})
        data = {'content': 'Rest in peace', 'author_name': 'Friend'}

        # AnonRateThrottle is set to 60/minute.
        for i in range(60):
            response = self.client.post(url, data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED, f"Failed on request {i+1}")

        # 61st request should be throttled
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_light_candle_rate_limit(self):
        from django.core.cache import cache
        cache.clear()

        url = reverse('api_memorial_candle', kwargs={'pk': self.memorial.pk})
        data = {'lit_by': 'Friend', 'message': 'Thinking of you'}

        # AnonRateThrottle is set to 60/minute.
        for i in range(60):
            response = self.client.post(url, data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED, f"Failed on request {i+1}")

        # 61st request should be throttled
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
