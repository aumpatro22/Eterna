## 2024-06-25 - [Missing Throttle on Public Form]
**Vulnerability:** Unauthenticated `public_submit_contact` endpoint lacked rate limiting.
**Learning:** Django REST Framework custom throttles need to be explicitly added to `DEFAULT_THROTTLE_RATES` in `settings.py` and then applied using `@throttle_classes([CustomThrottle])` for unauthenticated endpoints.
**Prevention:** Always audit `@permission_classes([])` endpoints to ensure they have appropriate rate limits to prevent spam and DoS attacks.
