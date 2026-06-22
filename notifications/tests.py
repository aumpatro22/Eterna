from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.force_authenticate(user=self.user)

        self.user2 = User.objects.create_user(username='otheruser', password='testpassword')

    def test_list_notifications(self):
        # Create some notifications for the user
        Notification.objects.create(user=self.user, title='Test 1', message='Message 1')
        Notification.objects.create(user=self.user, title='Test 2', message='Message 2')

        # Create a notification for another user
        Notification.objects.create(user=self.user2, title='Test Other', message='Message Other')

        # Request notifications
        response = self.client.get('/api/notifications/')

        # Check status and response length
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only return notifications for self.user
        self.assertEqual(len(response.data), 2)

        # Order should be descending by created_at (Test 2 was created after Test 1)
        self.assertEqual(response.data[0]['title'], 'Test 2')
        self.assertEqual(response.data[1]['title'], 'Test 1')

    def test_list_notifications_limit(self):
        # Create 55 notifications
        for i in range(55):
            Notification.objects.create(user=self.user, title=f'Test {i}', message=f'Message {i}')

        response = self.client.get('/api/notifications/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should limit to 50
        self.assertEqual(len(response.data), 50)
        # The latest notification should be the first one
        self.assertEqual(response.data[0]['title'], 'Test 54')

    def test_list_notifications_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
