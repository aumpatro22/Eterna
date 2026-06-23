import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-key-for-dev')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = [h for h in os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if h]

# Allow Render's external hostname if provided by platform
RENDER_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_HOSTNAME and RENDER_HOSTNAME not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RENDER_HOSTNAME)

# CSRF trusted origins (from Render hostname or env)
_env_csrf = [o for o in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',') if o]
if RENDER_HOSTNAME:
    _env_csrf.append(f"https://{RENDER_HOSTNAME}")
CSRF_TRUSTED_ORIGINS = _env_csrf or []

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'cloudinary_storage',
    'django.contrib.staticfiles',
    'cloudinary',
    
    # Third-party
    'rest_framework',
    'corsheaders',
    'django_bleach',
    
    # Local apps
    'memorials',
    'users',
    'communities',
    'tales',
    'notifications',
    'whitenoise.runserver_nostatic',  # ensure whitenoise controls static even in dev
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'users.middleware.LastSeenMiddleware',
]

ROOT_URLCONF = 'eternal_memories.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'eternal_memories.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
        'CONN_MAX_AGE': 300,
    }
}

# Override with DATABASE_URL when present (Render)
IS_TESTING = 'test' in sys.argv

if os.environ.get('DATABASE_URL') and not IS_TESTING:
    try:
        import dj_database_url
        DATABASES['default'] = dj_database_url.config(
            conn_max_age=300,
            ssl_require=(os.environ.get('PGSSLMODE') == 'require' or not DEBUG)
        )
    except Exception:
        pass

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
_static_dirs = []
if (BASE_DIR / 'static').exists():
    _static_dirs.append(BASE_DIR / 'static')
if (BASE_DIR / 'frontend' / 'dist').exists():
    _static_dirs.append(BASE_DIR / 'frontend' / 'dist')
STATICFILES_DIRS = _static_dirs
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Cloudinary Integration
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '')

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': CLOUDINARY_CLOUD_NAME,
        'API_KEY': CLOUDINARY_API_KEY,
        'API_SECRET': CLOUDINARY_API_SECRET,
    }
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
else:
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# AI API Settings
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
AI_HORDE_API_KEY = os.environ.get('AI_HORDE_API_KEY', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# Auth settings
LOGIN_REDIRECT_URL = 'home'
LOGOUT_REDIRECT_URL = 'home'

# Security/Proxy headers for Render (behind proxy)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
PRODUCTION = bool(os.environ.get('RENDER')) or not DEBUG
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True'

if PRODUCTION:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SAMESITE = 'None'
else:
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False') == 'True'
    CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'False') == 'True'
    SESSION_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SAMESITE = 'Lax'

# Session configuration for idle user logout (2 hours)
SESSION_COOKIE_AGE = 7200
SESSION_SAVE_EVERY_REQUEST = True

# Email configuration: console backend by default to avoid ConnectionRefused
# Only enable SMTP when all required vars are present.
_email_host = os.environ.get('EMAIL_HOST')
_email_user = os.environ.get('EMAIL_HOST_USER')
_email_pass = os.environ.get('EMAIL_HOST_PASSWORD')

if _email_host and _email_user and _email_pass:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = _email_host
    EMAIL_HOST_USER = _email_user
    EMAIL_HOST_PASSWORD = _email_pass
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
    EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
    EMAIL_TIMEOUT = int(os.environ.get('EMAIL_TIMEOUT', 10))
    DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', _email_user)
    SERVER_EMAIL = os.environ.get('SERVER_EMAIL', DEFAULT_FROM_EMAIL)
else:
    # Safe default: print emails to console/log; password reset won’t try SMTP
    EMAIL_BACKEND = os.environ.get(
        'EMAIL_BACKEND',
        'django.core.mail.backends.console.EmailBackend'
    )
    DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'no-reply@localhost')
    SERVER_EMAIL = os.environ.get('SERVER_EMAIL', DEFAULT_FROM_EMAIL)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
        'users.permissions.IsNotBanned',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '1000/day',
        'auth': '5/minute',
        'messages': '30/minute',
        'reports': '10/minute',
    }
}

# CORS settings (for Vite dev server)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
CSRF_TRUSTED_ORIGINS += [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

FRONTEND_URL = os.environ.get('FRONTEND_URL')
if FRONTEND_URL:
    if FRONTEND_URL == '*':
        CORS_ALLOW_ALL_ORIGINS = True
        CORS_ALLOW_CREDENTIALS = False
    else:
        from urllib.parse import urlparse
        parsed = urlparse(FRONTEND_URL)
        if parsed.scheme and parsed.netloc:
            origin = f"{parsed.scheme}://{parsed.netloc}"
            CORS_ALLOWED_ORIGINS.append(origin)
            CSRF_TRUSTED_ORIGINS.append(origin)

# Eterna Support Circle Co-Admin Limits
MAX_COMMUNITY_COADMINS = 3

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Free Tier Daily Message limits
FREE_TIER_DAILY_DM_LIMIT = 30
FREE_TIER_DAILY_COMMUNITY_LIMIT = 30

# Eterna Dashboard V1 Admin settings
DAILY_DM_LIMIT = 30
DAILY_COMMUNITY_POST_LIMIT = 50
IMAGE_LIMIT_MB = 5
AUDIO_LIMIT_MB = 10
FREE_MEMORIAL_LIMIT = 3
SESSION_TIMEOUT_SECONDS = 3600
DEFAULT_USER_STORAGE_LIMIT = 52428800
