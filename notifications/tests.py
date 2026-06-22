from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Notification

User = get_user_model()

class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')

    def test_create_notification(self):
        # Happy path
        notification = Notification.objects.create(
            user=self.user,
            title='Test Notification',
            message='This is a test notification.'
        )
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.title, 'Test Notification')
        self.assertEqual(notification.message, 'This is a test notification.')
        self.assertFalse(notification.is_read) # Default value
        self.assertIsNotNone(notification.created_at)
class NotificationApiTests(APITestCase):

    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(username='user1', password='Password123!', email='u1@example.com')
        self.user2 = User.objects.create_user(username='user2', password='Password123!', email='u2@example.com')

    def test_mark_all_as_read(self):
        # Create some unread notifications for user1
        notif1 = Notification.objects.create(user=self.user1, title='Test 1', message='Message 1')
        notif2 = Notification.objects.create(user=self.user1, title='Test 2', message='Message 2')

        # Create a read notification for user1
        notif3 = Notification.objects.create(user=self.user1, title='Test 3', message='Message 3', is_read=True)

        # Create an unread notification for user2 to ensure isolation
        notif4 = Notification.objects.create(user=self.user2, title='Test 4', message='Message 4')

        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)

        # Call the endpoint
        response = self.client.post('/api/notifications/read-all/')

        # Assert response is OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'all_read')

        # Refresh from db
        notif1.refresh_from_db()
        notif2.refresh_from_db()
        notif3.refresh_from_db()
        notif4.refresh_from_db()

        # Assert user1's notifications are marked as read
        self.assertTrue(notif1.is_read)
        self.assertTrue(notif2.is_read)
        self.assertTrue(notif3.is_read)

        # Assert user2's notification is untouched
        self.assertFalse(notif4.is_read)

    def test_mark_all_as_read_unauthenticated(self):
        # Ensure we are not authenticated
        self.client.logout()

        # Call the endpoint
        response = self.client.post('/api/notifications/read-all/')

        # Assert response is Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
