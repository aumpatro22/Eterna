from django.test import TestCase, Client
from django.core.cache import cache
from django.contrib.auth import get_user_model
from memorials.models import Memorial
import uuid

User = get_user_model()

class ThrottleTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = Client()
        self.user = User.objects.create_user(username='test', password='password')
        self.memorial = Memorial.objects.create(
            full_name='Test',
            biography='Test',
            owner=self.user,
            visibility='PUBLIC',
            public_id='test-memorial'
        )

    def test_add_message_throttle(self):
        cache.clear()
        # The DRF default is 60/minute, we do a loop to test it
        for i in range(60):
            response = self.client.post(f'/api/memorials/{self.memorial.pk}/messages/', {'content': 'test', 'author_name': 'test'})
            self.assertNotEqual(response.status_code, 429)

        response = self.client.post(f'/api/memorials/{self.memorial.pk}/messages/', {'content': 'test', 'author_name': 'test'})
        self.assertEqual(response.status_code, 429)

    def test_light_candle_throttle(self):
        cache.clear()
        for i in range(60):
            response = self.client.post(f'/api/memorials/{self.memorial.pk}/candles/', {'lit_by': 'test', 'message': 'test'})
            self.assertNotEqual(response.status_code, 429)

        response = self.client.post(f'/api/memorials/{self.memorial.pk}/candles/', {'lit_by': 'test', 'message': 'test'})
        self.assertEqual(response.status_code, 429)
