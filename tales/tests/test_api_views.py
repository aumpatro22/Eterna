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

class TaleListAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1', password='Password123!', email='user1@example.com'
        )
        self.user2 = User.objects.create_user(
            username='user2', password='Password123!', email='user2@example.com'
        )

        self.public_tale_u1 = Tale.objects.create(
            author=self.user1, title='Public Tale User 1', is_public=True
        )
        self.private_tale_u1 = Tale.objects.create(
            author=self.user1, title='Private Tale User 1', is_public=False
        )

        self.public_tale_u2 = Tale.objects.create(
            author=self.user2, title='Public Tale User 2', is_public=True
        )
        self.private_tale_u2 = Tale.objects.create(
            author=self.user2, title='Private Tale User 2', is_public=False
        )

        self.url = reverse('api_tale_list')

    def test_list_tales_unauthenticated(self):
        """Unauthenticated user only sees public tales."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        titles = [t['title'] for t in response.data['results']]
        self.assertIn('Public Tale User 1', titles)
        self.assertIn('Public Tale User 2', titles)
        self.assertNotIn('Private Tale User 1', titles)
        self.assertNotIn('Private Tale User 2', titles)

    def test_list_tales_authenticated_idor(self):
        """Authenticated user sees public tales and THEIR OWN private tales, but not others' private tales."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        titles = [t['title'] for t in response.data['results']]
        self.assertIn('Public Tale User 1', titles)
        self.assertIn('Public Tale User 2', titles)
        self.assertIn('Private Tale User 1', titles) # Own private tale
        self.assertNotIn('Private Tale User 2', titles) # IDOR check: Should NOT see user2's private tale
