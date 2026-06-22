from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from tales.models import Tale

User = get_user_model()


class TaleCreateAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='Password123!',
            email='testuser@example.com'
        )
        self.url = reverse('api_tale_create')

    def test_create_tale_authenticated_success(self):
        """Test successfully creating a tale with an authenticated user."""
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'My Epic Tale',
            'subtitle': 'A journey begins',
            'description': 'This is the description of my epic tale.',
            'is_public': True
        }
        response = self.client.post(self.url, data, format='json')

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['author_username'], self.user.username)
        self.assertEqual(response.data['author_id'], self.user.id)

        # Verify database state
        self.assertEqual(Tale.objects.count(), 1)
        tale = Tale.objects.first()
        self.assertEqual(tale.title, data['title'])
        self.assertEqual(tale.author, self.user)
        self.assertTrue(tale.is_public)

    def test_create_tale_unauthenticated(self):
        """Test creating a tale fails if the user is not authenticated."""
        data = {
            'title': 'My Epic Tale',
        }
        response = self.client.post(self.url, data, format='json')

        # Verify response (drf returns 401 Unauthorized or 403 Forbidden based on auth classes)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Verify database state
        self.assertEqual(Tale.objects.count(), 0)

    def test_create_tale_invalid_data(self):
        """Test creating a tale with invalid data (e.g., missing required title)."""
        self.client.force_authenticate(user=self.user)
        # Title is required by the model and thus the serializer
        data = {
            'subtitle': 'A journey begins',
            'description': 'This is the description of my epic tale.'
        }
        response = self.client.post(self.url, data, format='json')

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

        # Verify database state
        self.assertEqual(Tale.objects.count(), 0)
