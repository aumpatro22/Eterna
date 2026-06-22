from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Tale

User = get_user_model()

class TaleModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')

    def test_tale_creation(self):
        tale = Tale.objects.create(
            author=self.user,
            title="A Test Tale",
            subtitle="The subtitle",
            description="The description"
        )
        self.assertEqual(tale.author, self.user)
        self.assertEqual(tale.title, "A Test Tale")
        self.assertTrue(tale.is_public)
        self.assertIsNotNone(tale.created_at)

    def test_tale_str(self):
        tale = Tale.objects.create(author=self.user, title="A Test Tale")
        self.assertEqual(str(tale), "A Test Tale")

    def test_tale_bleach_cleaning(self):
        tale = Tale.objects.create(
            author=self.user,
            title="<b>Bold Title</b>",
            subtitle="<i>Italic Subtitle</i>",
            description="<p>Paragraph Description</p><script>alert('hack')</script>"
        )
        self.assertEqual(tale.title, "Bold Title")
        self.assertEqual(tale.subtitle, "Italic Subtitle")
        self.assertEqual(tale.description, "Paragraph Descriptionalert('hack')")

    def test_tale_slug_generation(self):
        tale = Tale.objects.create(author=self.user, title="A Simple Test Tale")
        self.assertEqual(tale.slug, "a-simple-test-tale")

    def test_tale_slug_uniqueness(self):
        tale1 = Tale.objects.create(author=self.user, title="Duplicate Title")
        tale2 = Tale.objects.create(author=self.user, title="Duplicate Title")
        tale3 = Tale.objects.create(author=self.user, title="Duplicate Title")

        self.assertEqual(tale1.slug, "duplicate-title")
        self.assertEqual(tale2.slug, "duplicate-title-2")
        self.assertEqual(tale3.slug, "duplicate-title-3")

    def test_tale_slug_truncation(self):
        long_title = "A" * 200
        tale = Tale.objects.create(author=self.user, title=long_title)

        expected_base = "a" * 175
        self.assertEqual(tale.slug, expected_base)

        tale2 = Tale.objects.create(author=self.user, title=long_title)
        expected_suffix = "-2"
        expected_base2 = "a" * (175 - len(expected_suffix)) + expected_suffix
        self.assertEqual(tale2.slug, expected_base2)
