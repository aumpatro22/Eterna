from django.utils import timezone
from datetime import timedelta

class LastSeenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            current_time = timezone.now()
            last_updated_str = request.session.get('last_seen_updated')
            should_update = True

            if last_updated_str:
                try:
                    from django.utils.dateparse import parse_datetime
                    last_updated = parse_datetime(last_updated_str)
                    if last_updated and (current_time - last_updated) < timedelta(minutes=5):
                        should_update = False
                except Exception:
                    pass

            if should_update:
                try:
                    profile = request.user.profile
                    profile.last_seen = current_time
                    profile.save(update_fields=['last_seen'])
                    request.session['last_seen_updated'] = current_time.isoformat()
                except Exception:
                    pass

        response = self.get_response(request)
        return response
