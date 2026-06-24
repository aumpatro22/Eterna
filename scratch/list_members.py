import os
import sys
import django

# Add the root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eternal_memories.settings')
django.setup()

from django.contrib.auth import get_user_model
from communities.models import Membership, CommunityJoinRequest

User = get_user_model()

print("--- Memberships ---")
for m in Membership.objects.select_related('user', 'community').all():
    print(f"User: {m.user.username}, Community: {m.community.slug}, Role: {m.role}")

print("\n--- Join Requests ---")
for r in CommunityJoinRequest.objects.select_related('user', 'community').all():
    print(f"User: {r.user.username}, Community: {r.community.slug}, Status: {r.status}")
