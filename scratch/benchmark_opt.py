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

reset_queries()

start_time = time.time()

# The optimized code under test
count = 0
for m in Membership.objects.select_related('user', 'community').all():
    # Simulate the work
    _ = f"User: {m.user.username}, Community: {m.community.slug}, Role: {m.role}"
    count += 1

end_time = time.time()

print(f"Processed {count} memberships")
print(f"Queries: {len(connection.queries)}")
print(f"Time: {end_time - start_time:.4f} seconds")
