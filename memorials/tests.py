from django.test import TestCase
from django.contrib.auth import get_user_model
from memorials.models import Memorial
import datetime

User = get_user_model()

class MemorialModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')

    def test_memorial_creation(self):
        """Test basic memorial creation with all fields and string representation."""
        memorial = Memorial.objects.create(
            owner=self.user,
            full_name="John Doe",
            birth_date=datetime.date(1950, 1, 1),
            passing_date=datetime.date(2020, 12, 31),
            biography="A loving father.",
            tribute="He will be missed."
        )
        self.assertEqual(memorial.full_name, "John Doe")
        self.assertEqual(memorial.birth_date, datetime.date(1950, 1, 1))
        self.assertEqual(memorial.passing_date, datetime.date(2020, 12, 31))
        self.assertEqual(memorial.biography, "A loving father.")
        self.assertEqual(memorial.tribute, "He will be missed.")
        self.assertEqual(str(memorial), "Memorial for John Doe")
        self.assertEqual(memorial.owner, self.user)
        self.assertEqual(memorial.visibility, "PUBLIC") # default value

    def test_public_id_auto_generation(self):
        """Test that public_id is auto-generated on save if not provided."""
        memorial = Memorial.objects.create(
            owner=self.user,
            full_name="Jane Doe",
            biography="A wonderful mother."
        )
        self.assertTrue(bool(memorial.public_id))
        self.assertLessEqual(len(memorial.public_id), 22)

    def test_bleach_cleaning_on_save(self):
        """Test that HTML tags are stripped from text fields."""
        memorial = Memorial.objects.create(
            owner=self.user,
            full_name="<b>Bold Name</b>",
            biography="<script>alert('test')</script> Biography",
            tribute="<i>Italic Tribute</i>"
        )
        self.assertEqual(memorial.full_name, "Bold Name")
        self.assertEqual(memorial.biography, "alert('test') Biography")
        self.assertEqual(memorial.tribute, "Italic Tribute")
