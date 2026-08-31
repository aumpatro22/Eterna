## 2025-02-14 - [Missing Rate Limiting on Contact Submit]
**Vulnerability:** The unauthenticated `public_submit_contact` API endpoint lacked rate limiting.
**Learning:** Any endpoint accepting unauthenticated POST data is susceptible to bot spam.
**Prevention:** Apply `@throttle_classes([AnonRateThrottle])` to all public, unauthenticated submission endpoints.

## 2025-02-14 - [Missing Rate Limiting on Memorial Endpoints]
**Vulnerability:** The unauthenticated `add_message` and `light_candle` API endpoints in `memorials/api_views.py` lacked rate limiting.
**Learning:** Any endpoint accepting unauthenticated POST data, including interacting with public memorials, is susceptible to bot spam and abuse.
**Prevention:** Always apply `@throttle_classes([AnonRateThrottle])` to all public, unauthenticated submission endpoints, not just top-level endpoints like contact forms.
