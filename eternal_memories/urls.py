from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from .spa_view import spa_view

urlpatterns = [
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/memorials/', include('memorials.api_urls')),
    path('api/', include('users.api_urls')),
    path('api/tales/', include('tales.api_urls')),
    path('api/communities/', include('communities.api_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# SPA catch-all — must be last so it doesn't shadow API/admin/media routes
urlpatterns += [
    re_path(r'^(?!api/|admin/|media/|static/).*$', spa_view, name='spa'),
]
