## 2025-02-14 - [Missing Rate Limiting on Contact Submit]
**Vulnerability:** The unauthenticated `public_submit_contact` API endpoint lacked rate limiting.
**Learning:** Any endpoint accepting unauthenticated POST data is susceptible to bot spam.
**Prevention:** Apply `@throttle_classes([AnonRateThrottle])` to all public, unauthenticated submission endpoints.

## 2025-03-09 - [Missing Rate Limiting on Memorial Actions]
**Vulnerability:** The unauthenticated endpoints for adding messages and lighting candles (`add_message`, `light_candle`) lacked rate limiting.
**Learning:** Any endpoint accepting unauthenticated POST data is susceptible to bot spam and abuse. This can lead to DB bloat or excessive unwanted content in memorials.
**Prevention:** Apply `@throttle_classes([AnonRateThrottle])` to all public, unauthenticated submission endpoints, including user content creation ones.
