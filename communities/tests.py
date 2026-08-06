from django.test import TestCase
from django.contrib.auth import get_user_model
from communities.models import Community

User = get_user_model()

class CommunityModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testowner', password='Password123!')

    def test_community_creation_and_str(self):
        """Test basic creation of a Community and its __str__ representation."""
        community = Community.objects.create(
            owner=self.user,
            title="Support Group",
            description="A place for support."
        )
        self.assertEqual(community.title, "Support Group")
        self.assertEqual(str(community), "Support Group")
        self.assertEqual(community.owner, self.user)
        self.assertEqual(community.community_type, "PUBLIC") # default

    def test_automatic_slug_generation(self):
        """Test that a slug is automatically generated from the title if not provided."""
        community = Community.objects.create(
            owner=self.user,
            title="Grief Support Group!"
        )
        # The save method should slugify the title
        self.assertEqual(community.slug, "grief-support-group")

    def test_field_sanitization(self):
        """Test that HTML tags are stripped from text fields using bleach."""
        community = Community.objects.create(
            owner=self.user,
            title="<b>Support</b> Group",
            description="<script>alert('xss')</script>Description",
            rules="<i>Rule 1</i>",
            welcome_message="<h1>Welcome</h1>"
        )
        self.assertEqual(community.title, "Support Group")
        self.assertEqual(community.description, "Description")
        self.assertEqual(community.rules, "Rule 1")
        self.assertEqual(community.welcome_message, "Welcome")
