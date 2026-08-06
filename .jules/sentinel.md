# Sentinel Learnings

- `SECRET_KEY` must raise an `ImproperlyConfigured` exception in production if not explicitly set via an environment variable. If we allow a randomly generated or hardcoded fallback, it will drop sessions in production and/or introduce severe security vulnerabilities (e.g., cookie manipulation, password reset token predictability).
