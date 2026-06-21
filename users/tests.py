from django.test import TestCase
from django.contrib.auth import get_user_model
User = get_user_model()
from django.contrib.contenttypes.models import ContentType
from rest_framework import status
from rest_framework.test import APITestCase
from communities.models import Community, Membership
from users.models import Profile, Conversation, DirectMessage, CircleConnection, ProfileTimelineEvent, Report


class EternaSocialApiTests(APITestCase):

    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(username='user1', password='Password123!', email='u1@example.com')
        self.user2 = User.objects.create_user(username='user2', password='Password123!', email='u2@example.com')
        self.user3 = User.objects.create_user(username='user3', password='Password123!', email='u3@example.com')
        self.user4 = User.objects.create_user(username='user4', password='Password123!', email='u4@example.com')
        
        # Ensure profiles exist (sometimes signal auto-creates, but let's be sure or update privacy)
        self.p1 = self.user1.profile
        self.p2 = self.user2.profile

    def test_profile_privacy_connections_only(self):
        # Set user1 profile to CONNECTIONS_ONLY
        self.p1.privacy_setting = 'CONNECTIONS_ONLY'
        self.p1.save()

        # Try to view profile anonymous - should be 403
        response = self.client.get(f'/api/users/{self.user1.username}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['privacy_setting'], 'CONNECTIONS_ONLY')

        # Log in as user2 (not connected) - should be 403
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f'/api/users/{self.user1.username}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Send connection request from user2 to user1
        conn = CircleConnection.objects.create(
            sender=self.user2,
            receiver=self.user1,
            status='PENDING',
            connection_type='FRIEND'
        )

        # Try to view profile with pending connection - should still be 403
        response = self.client.get(f'/api/users/{self.user1.username}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['connection_status'], 'PENDING')

        # Accept connection request as user1
        conn.status = 'ACCEPTED'
        conn.save()

        # Try to view profile with accepted connection - should be 200
        response = self.client.get(f'/api/users/{self.user1.username}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['profile']['is_connection'])

    def test_profile_privacy_private(self):
        # Set user1 profile to PRIVATE
        self.p1.privacy_setting = 'PRIVATE'
        self.p1.save()

        # Try to view profile as user2 - should be 403
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f'/api/users/{self.user1.username}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['privacy_setting'], 'PRIVATE')

    def test_profile_timeline_events(self):
        self.client.force_authenticate(user=self.user1)
        
        # Add a timeline event
        response = self.client.post('/api/profiles/timeline/', {
            'title': 'Graduated College',
            'event_date': '2026-06-01',
            'description': 'Finished my engineering degree.'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProfileTimelineEvent.objects.count(), 1)
        
        ev_id = response.data['id']
        
        # Delete timeline event
        response = self.client.delete(f'/api/profiles/timeline/{ev_id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ProfileTimelineEvent.objects.count(), 0)

    def test_direct_messaging_and_blocking(self):
        self.client.force_authenticate(user=self.user1)

        # Create/Get conversation between user1 and user2
        response = self.client.post('/api/conversations/create/', {'username': self.user2.username})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        conv_id = response.data['id']

        # Send DM from user1 to user2
        response = self.client.post(f'/api/conversations/{conv_id}/messages/send/', {'content': 'Hello!'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DirectMessage.objects.count(), 1)

        # Block conversation as user1
        response = self.client.post(f'/api/conversations/{conv_id}/block/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'blocked')

        # Try to send DM as user2 while blocked - should be 400
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f'/api/conversations/{conv_id}/messages/send/', {'content': 'Howdy?'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Try to unblock as user2 (not original blocker) - should be 403
        response = self.client.post(f'/api/conversations/{conv_id}/block/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Unblock as user1
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f'/api/conversations/{conv_id}/block/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'unblocked')

        # Try to send DM as user2 now - should succeed
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f'/api/conversations/{conv_id}/messages/send/', {'content': 'Howdy now!'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_reporting_system(self):
        self.client.force_authenticate(user=self.user1)

        # Create report on user2
        response = self.client.post('/api/reports/', {
            'target_type': 'USER',
            'target_id': self.user2.id,
            'reason': 'HARASSMENT',
            'description': 'Sent inappropriate connection messages'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Report.objects.count(), 1)

        rep = Report.objects.first()
        self.assertEqual(rep.reason, 'HARASSMENT')
        self.assertEqual(rep.object_id, self.user2.id)
        self.assertEqual(rep.content_type, ContentType.objects.get_for_model(User))

    def test_community_coadmin_limits(self):
        # Create community with user1 as Admin
        self.community = Community.objects.create(
            title=' Sharma Family Circle',
            slug='sharma-family-circle',
            community_type='PUBLIC',
            owner=self.user1
        )
        Membership.objects.create(community=self.community, user=self.user1, role='ADMIN')

        # Set user1 as authenticated
        self.client.force_authenticate(user=self.user1)

        # Add 3 co-admins (user2, user3, user4)
        Membership.objects.create(community=self.community, user=self.user2, role='CO_ADMIN')
        Membership.objects.create(community=self.community, user=self.user3, role='CO_ADMIN')
        Membership.objects.create(community=self.community, user=self.user4, role='CO_ADMIN')

        # Try to upgrade another user (e.g. user5) to CO_ADMIN - should fail co-admin limit (max 3)
        self.user5 = User.objects.create_user(username='user5', password='Password123!')
        Membership.objects.create(community=self.community, user=self.user5, role='MEMBER')

        # Upgrade request via API
        response = self.client.post(f'/api/communities/{self.community.slug}/members/{self.user5.username}/role/', {
            'role': 'CO_ADMIN'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('co-admins', response.data['error'])

    def test_email_exclusion_on_public_profiles(self):
        # View profile of user1 as user2 (public profile)
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f'/api/users/{self.user1.username}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Ensure email is absent in the profile user block
        user_data = response.data['profile']['user']
        self.assertNotIn('email', user_data)
        self.assertEqual(user_data['username'], self.user1.username)

    def test_private_memorial_idor_protection(self):
        # Create private memorial for user1
        from memorials.models import Memorial
        memorial = Memorial.objects.create(
            owner=self.user1,
            full_name="John Doe",
            visibility="PRIVATE"
        )
        
        # Visitor (user2) attempts to post guestbook message - expect 403
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f'/api/memorials/{memorial.id}/messages/', {
            'author_name': 'Anonymous Visitor',
            'content': 'Heartfelt message'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Visitor (user2) attempts to light candle - expect 403
        response = self.client.post(f'/api/memorials/{memorial.id}/candles/', {
            'lit_by': 'Visitor',
            'message': 'Love and light'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Owner (user1) attempts - expect 201
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f'/api/memorials/{memorial.id}/messages/', {
            'author_name': 'Owner',
            'content': 'Test message'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_contributor_delete_permissions(self):
        # Create memorial and memory
        from memorials.models import Memorial, Memory, Contributor
        memorial = Memorial.objects.create(
            owner=self.user1,
            full_name="John Doe",
            visibility="PUBLIC"
        )
        # user2 is the author of memory
        memory = Memory.objects.create(
            memorial=memorial,
            author=self.user2,
            title="A Memory",
            story="Beautiful story"
        )
        # user3 is a contributor to the memorial, but not the author of this memory
        Contributor.objects.create(memorial=memorial, user=self.user3, role="FAMILY_MEMBER")

        # user3 (regular contributor, not author) tries to delete the memory - expect 403
        self.client.force_authenticate(user=self.user3)
        response = self.client.delete(f'/api/memorials/memories/{memory.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # user2 (memory author) tries to delete it - expect 200
        self.client.force_authenticate(user=self.user2)
        response = self.client.delete(f'/api/memorials/memories/{memory.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_file_validation_rules(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        from django.core.exceptions import ValidationError
        from users.validators import validate_image_file, validate_audio_file
        
        # 1. Reject large image file
        large_data = b'0' * (5 * 1024 * 1024 + 1)
        large_image = SimpleUploadedFile("test.png", large_data, content_type="image/png")
        with self.assertRaises(ValidationError):
            validate_image_file(large_image)
            
        # 2. Reject non-image extension
        bad_ext_file = SimpleUploadedFile("test.exe", b'fake executable data', content_type="image/png")
        with self.assertRaises(ValidationError):
            validate_image_file(bad_ext_file)

        # 3. Reject bad MIME type
        bad_mime_file = SimpleUploadedFile("test.png", b'some text content', content_type="application/zip")
        with self.assertRaises(ValidationError):
            validate_image_file(bad_mime_file)

        # 4. Reject large audio file
        large_audio_data = b'0' * (20 * 1024 * 1024 + 1)
        large_audio = SimpleUploadedFile("test.mp3", large_audio_data, content_type="audio/mpeg")
        with self.assertRaises(ValidationError):
            validate_audio_file(large_audio)

    def test_rate_limiting_auth(self):
        # Call login/register views repeatedly to trigger rate limit (max 5/min)
        from django.core.cache import cache
        cache.clear()
        
        # Hit register_view 6 times
        for i in range(6):
            response = self.client.post('/api/auth/register/', {
                'username': f'ratelimituser{i}',
                'email': f'rl{i}@example.com',
                'first_name': 'Rate',
                'last_name': 'Limit',
                'password': 'Password123!',
                'password2': 'Password123!'
            })
            if i >= 5:
                # 6th request should return 429 Too Many Requests
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
                
    def test_community_ban_system(self):
        from communities.models import Community, Membership, CommunityBan
        # Create community owned by user1
        community = Community.objects.create(
            title='Test Ban Community',
            slug='test-ban-community',
            community_type='PUBLIC',
            owner=self.user1
        )
        Membership.objects.create(community=community, user=self.user1, role='ADMIN')
        
        # Banned user (user2)
        CommunityBan.objects.create(community=community, user=self.user2, banned_by=self.user1, reason="Trolling")
        
        # user2 attempts to join - expect 403
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f'/api/communities/{community.slug}/join/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Moderator (user1) attempts to invite user2 - expect 400
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f'/api/communities/{community.slug}/invite/', {
            'username': self.user2.username
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('banned', response.data['error'])


class EternaSessionAndIdleTests(TestCase):
    def setUp(self):
        from django.test import RequestFactory
        self.factory = RequestFactory()
        self.user = User.objects.create_user(username='testlastseen', password='Password123!')
        self.profile = self.user.profile

    def test_session_settings(self):
        from django.conf import settings
        self.assertEqual(settings.SESSION_COOKIE_AGE, 7200)
        self.assertTrue(settings.SESSION_SAVE_EVERY_REQUEST)
        self.assertEqual(settings.DATABASES['default']['CONN_MAX_AGE'], 300)

    def test_last_seen_middleware_authenticated(self):
        from django.contrib.sessions.backends.db import SessionStore
        from django.http import HttpResponse
        from users.middleware import LastSeenMiddleware
        
        request = self.factory.get('/api/users/me/')
        request.user = self.user
        request.session = SessionStore()
        
        middleware = LastSeenMiddleware(lambda req: HttpResponse("OK"))
        
        # Profile last_seen is initially None
        self.assertIsNone(self.profile.last_seen)
        
        # First call updates last_seen
        response = middleware(request)
        self.assertEqual(response.content, b"OK")
        
        self.profile.refresh_from_db()
        self.assertIsNotNone(self.profile.last_seen)
        first_last_seen = self.profile.last_seen
        
        # Second call immediately should not update last_seen (throttled)
        from django.utils import timezone
        from datetime import timedelta
        fake_time = timezone.now() - timedelta(hours=1)
        self.profile.last_seen = fake_time
        self.profile.save()
        
        response = middleware(request)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.last_seen, fake_time)
        
        # Set session cache updated timestamp to > 5 mins ago
        request.session['last_seen_updated'] = (timezone.now() - timedelta(minutes=6)).isoformat()
        response = middleware(request)
        self.profile.refresh_from_db()
        self.assertNotEqual(self.profile.last_seen, fake_time)

    def test_last_seen_middleware_anonymous(self):
        from django.contrib.auth.models import AnonymousUser
        from django.http import HttpResponse
        from users.middleware import LastSeenMiddleware
        
        request = self.factory.get('/api/users/me/')
        request.user = AnonymousUser()
        request.session = {}
        
        middleware = LastSeenMiddleware(lambda req: HttpResponse("OK"))
        response = middleware(request)
        self.assertEqual(response.content, b"OK")

