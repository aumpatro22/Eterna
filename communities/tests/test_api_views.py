from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from communities.models import Community, Membership

User = get_user_model()


class CommunityCreateApiTests(APITestCase):
    def setUp(self):
        # Create user
        self.user1 = User.objects.create_user(username='user1', password='Password123!', email='u1@example.com')

    def test_community_create_success(self):
        """Test creating a community successfully."""
        self.client.force_authenticate(user=self.user1)
        data = {
            'title': 'Test Community',
            'description': 'A community for testing.',
            'community_type': 'PUBLIC'
        }

        response = self.client.post('/api/communities/create/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check community exists
        self.assertEqual(Community.objects.count(), 1)
        community = Community.objects.first()
        self.assertEqual(community.title, 'Test Community')
        self.assertEqual(community.description, 'A community for testing.')
        self.assertEqual(community.community_type, 'PUBLIC')
        self.assertEqual(community.owner, self.user1)

        # Check user is admin
        self.assertEqual(Membership.objects.count(), 1)
        membership = Membership.objects.first()
        self.assertEqual(membership.community, community)
        self.assertEqual(membership.user, self.user1)
        self.assertEqual(membership.role, 'ADMIN')

    def test_community_create_unauthenticated(self):
        """Test creating a community without authentication."""
        data = {
            'title': 'Test Community',
            'description': 'A community for testing.',
            'community_type': 'PUBLIC'
        }

        response = self.client.post('/api/communities/create/', data)
        # Should be 401 or 403
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
        self.assertEqual(Community.objects.count(), 0)

    def test_community_create_invalid_data(self):
        """Test creating a community with invalid data."""
        self.client.force_authenticate(user=self.user1)

        # Missing required 'title'
        data = {
            'description': 'A community for testing.',
            'community_type': 'PUBLIC'
        }

        response = self.client.post('/api/communities/create/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)
        self.assertEqual(Community.objects.count(), 0)
