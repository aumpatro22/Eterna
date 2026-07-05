## 2024-05-18 - Rate Limiting on Public Endpoints
**Vulnerability:** Missing rate limiting on unauthenticated `public_submit_contact` endpoint.
**Learning:** Publicly accessible endpoints like contact forms must use `AnonRateThrottle` or custom throttle classes to prevent spam and DoS attacks. The Eterna application uses DRF, making `@throttle_classes` an easy pattern to apply.
**Prevention:** Always verify that endpoints with `@permission_classes([])` implement appropriate rate limits.
