## 2025-02-14 - [Missing Rate Limiting on Contact Submit]
**Vulnerability:** The unauthenticated `public_submit_contact` API endpoint lacked rate limiting.
**Learning:** Any endpoint accepting unauthenticated POST data is susceptible to bot spam.
**Prevention:** Apply `@throttle_classes([AnonRateThrottle])` to all public, unauthenticated submission endpoints.
## 2025-02-15 - [Missing Rate Limiting on Memorial Unauthenticated POST Endpoints]
**Vulnerability:** The unauthenticated `add_message` and `light_candle` API endpoints in memorials app lacked rate limiting.
**Learning:** Any endpoint accepting unauthenticated POST data is susceptible to bot spam and DoS attacks. The `AnonRateThrottle` should be used consistently on such endpoints.
**Prevention:** Apply `@throttle_classes([AnonRateThrottle])` to all unauthenticated endpoints that create resources or mutate state.
