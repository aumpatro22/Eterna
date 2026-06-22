import os
import sys
import django
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eternal_memories.settings')

django.setup()

from django.conf import settings
settings.DEBUG = True

from django.db import connection, reset_queries
from django.contrib.auth import get_user_model
from communities.models import Community, Membership

User = get_user_model()

# Create dummy data if not exists
if Membership.objects.count() < 100:
    print("Creating dummy data...")
    users = []
    for i in range(10):
        u, _ = User.objects.get_or_create(username=f'user_{i}', email=f'user_{i}@example.com')
        users.append(u)

    communities = []
    for i in range(10):
        c, _ = Community.objects.get_or_create(title=f'Community {i}', slug=f'comm-{i}', owner=users[0])
        communities.append(c)

    for u in users:
        for c in communities:
            Membership.objects.get_or_create(user=u, community=c, role='MEMBER')

reset_queries()

start_time = time.time()

# The code under test
count = 0
for m in Membership.objects.all():
    # Simulate the work
    _ = f"User: {m.user.username}, Community: {m.community.slug}, Role: {m.role}"
    count += 1

end_time = time.time()

print(f"Processed {count} memberships")
print(f"Queries: {len(connection.queries)}")
print(f"Time: {end_time - start_time:.4f} seconds")
