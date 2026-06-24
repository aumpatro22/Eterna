from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from memorials.models import Memorial, Contributor, Message

User = get_user_model()

class AddMessageTest(APITestCase):

    def setUp(self):
        # Create users
        self.owner = User.objects.create_user(username='owner', password='Password123!', email='owner@example.com')
        self.user1 = User.objects.create_user(username='user1', password='Password123!', email='user1@example.com')

        # Give user1 a display_name via profile
        # Some signals might auto-create profile, so we use get_or_create
        profile1 = self.user1.profile
        profile1.display_name = 'User One'
        profile1.save()

        # Create public memorial
        self.public_memorial = Memorial.objects.create(
            owner=self.owner,
            full_name="Public Memorial",
            visibility="PUBLIC"
        )

        # Create private memorial
        self.private_memorial = Memorial.objects.create(
            owner=self.owner,
            full_name="Private Memorial",
            visibility="PRIVATE"
        )

    def test_unauthenticated_user_can_add_message(self):
        url = f'/api/memorials/{self.public_memorial.pk}/messages/'
        data = {
            'author_name': 'Guest User',
            'content': 'This is a message from an unauthenticated user.'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)
        message = Message.objects.first()
        self.assertEqual(message.author_name, 'Guest User')
        self.assertEqual(message.content, 'This is a message from an unauthenticated user.')

    def test_authenticated_user_infers_name_and_email(self):
        self.client.force_authenticate(user=self.user1)
        url = f'/api/memorials/{self.public_memorial.pk}/messages/'
        data = {
            'content': 'This is a message from an authenticated user.'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)
        message = Message.objects.first()
        self.assertEqual(message.author_name, 'User One') # Inferred from profile
        self.assertEqual(message.author_email, 'user1@example.com') # Inferred from user email
        self.assertEqual(message.content, 'This is a message from an authenticated user.')

    def test_authenticated_user_provides_author_name(self):
        self.client.force_authenticate(user=self.user1)
        url = f'/api/memorials/{self.public_memorial.pk}/messages/'
        data = {
            'author_name': 'Custom Name',
            'author_email': 'custom@example.com',
            'content': 'Message with custom name and email.'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)
        message = Message.objects.first()
        self.assertEqual(message.author_name, 'Custom Name')
        self.assertEqual(message.author_email, 'custom@example.com')
        self.assertEqual(message.content, 'Message with custom name and email.')

    def test_invalid_payload_missing_content(self):
        url = f'/api/memorials/{self.public_memorial.pk}/messages/'
        data = {
            'author_name': 'Guest User',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('content', response.data)

    def test_private_memorial_access_denied(self):
        url = f'/api/memorials/{self.private_memorial.pk}/messages/'
        data = {
            'author_name': 'Guest User',
            'content': 'Trying to post to a private memorial.'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Even authenticated but non-owner/non-contributor should be denied
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_private_memorial_access_allowed_for_owner(self):
        self.client.force_authenticate(user=self.owner)
        url = f'/api/memorials/{self.private_memorial.pk}/messages/'
        data = {
            'content': 'Owner posting to private memorial.'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)
