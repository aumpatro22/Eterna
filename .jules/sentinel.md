## 2025-02-14 - [Missing Rate Limiting on Contact Submit]
**Vulnerability:** The unauthenticated `public_submit_contact` API endpoint lacked rate limiting.
**Learning:** Any endpoint accepting unauthenticated POST data is susceptible to bot spam.
**Prevention:** Apply `@throttle_classes([AnonRateThrottle])` to all public, unauthenticated submission endpoints.
## 2026-09-03 - [Missing Rate Limiting on Memorial Actions]
**Vulnerability:** The unauthenticated `add_message` and `light_candle` API endpoints lacked rate limiting.
**Learning:** Just like the contact submit, interactive memorial actions allowing anonymous input are vulnerable to bot spam and abuse.
**Prevention:** Ensure `@throttle_classes([AnonRateThrottle])` is applied to all public `POST` endpoints, especially those dealing with user-generated content or actions.
