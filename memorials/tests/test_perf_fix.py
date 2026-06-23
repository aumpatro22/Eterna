import os
from django.test import TestCase

from django.contrib.auth import get_user_model
User = get_user_model()
from memorials.models import Memorial, Memory
from django.test import Client

class MemorialDetailNPlus1Test(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='testuser')
        self.author1 = User.objects.create(username='author1')
        self.author2 = User.objects.create(username='author2')
        self.author3 = User.objects.create(username='author3')
        self.memorial = Memorial.objects.create(owner=self.user, full_name='Test Memorial', visibility='PUBLIC')

        # Create 3 memories with distinct authors
        Memory.objects.create(memorial=self.memorial, author=self.author1, title='M1', story='S1', visibility='PUBLIC')
        Memory.objects.create(memorial=self.memorial, author=self.author2, title='M2', story='S2', visibility='PUBLIC')
        Memory.objects.create(memorial=self.memorial, author=self.author3, title='M3', story='S3', visibility='PUBLIC')

    def test_n_plus_1_queries(self):
        client = Client()
        # Verify that N+1 is fixed and the query count is 8 exactly.
        with self.assertNumQueries(8):
            response = client.get(f'/api/memorials/{self.memorial.id}/')
            self.assertEqual(response.status_code, 200)
