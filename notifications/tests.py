from django.test import TestCase
from django.contrib.auth import get_user_model
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
