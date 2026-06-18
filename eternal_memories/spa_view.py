from django.http import HttpResponse
from django.conf import settings
import os


def spa_view(request):
    """Serve the React SPA index.html for all non-API routes."""
    index_path = os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    # Fallback during development when React build doesn't exist yet
    return HttpResponse(
        '<h1>Eterna</h1>'
        '<p>React frontend not built yet. Run <code>cd frontend && npm run build</code> '
        'or use the Vite dev server at <a href="http://localhost:5173">http://localhost:5173</a>.</p>',
        content_type='text/html'
    )
