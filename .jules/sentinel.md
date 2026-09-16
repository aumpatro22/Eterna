## 2025-02-14 - [Missing Rate Limiting on Contact Submit]
**Vulnerability:** The unauthenticated `public_submit_contact` API endpoint lacked rate limiting.
**Learning:** Any endpoint accepting unauthenticated POST data is susceptible to bot spam.
**Prevention:** Apply `@throttle_classes([AnonRateThrottle])` to all public, unauthenticated submission endpoints.

## 2026-09-16 - [Missing Rate Limiting on Memorial Actions]
**Vulnerability:** The unauthenticated `add_message` and `light_candle` POST endpoints in the memorials app lacked rate limiting, exposing the system to bot spam and brute-force flooding.
**Learning:** Unauthenticated submission endpoints in any app (not just users) must be protected by rate limiters to prevent abuse.
**Prevention:** Apply `@throttle_classes([AnonRateThrottle])` to all public, unauthenticated submission endpoints across all apps.
