## 2026-07-16 - [Authorization Bypass on Banned Users]
**Vulnerability:** [Banned users retained active auth_tokens, allowing them to continue making authenticated requests.]
**Learning:** [When a user is banned, their existing active sessions and tokens must be explicitly revoked. In Django REST Framework with authtoken, this means deleting the `auth_token` related object.]
**Prevention:** [Always include token revocation logic when implementing ban or suspension functionality.]
