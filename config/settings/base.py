from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config("SECRET_KEY")
DEBUG = False
ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv(), default="127.0.0.1,localhost")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "axes",
    "channels",
    "core",
    "accounts",
    "chat",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "axes.middleware.AxesMiddleware",
    "core.middleware.DomainExceptionMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"
AUTH_USER_MODEL = "accounts.CustomUser"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── Redis ─────────────────────────────────────────────────
REDIS_URL = config("REDIS_URL", default="redis://127.0.0.1:6379/0")

# ── Sessions → Redis + DB fallback ────────────────────────
SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
SESSION_CACHE_ALIAS = "default"
SESSION_COOKIE_NAME = "sessionid"
SESSION_COOKIE_AGE = config("SESSION_COOKIE_AGE", default=604800, cast=int)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = config("SESSION_COOKIE_SECURE", default=False, cast=bool)
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_PATH = "/"
SESSION_SAVE_EVERY_REQUEST = False
SESSION_SERIALIZER = "django.contrib.sessions.serializers.JSONSerializer"

# ── Cache (Redis) ─────────────────────────────────────────
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SERIALIZER": "django_redis.serializers.json.JSONSerializer",
        },
    }
}

# ── Channel Layer (Redis) ─────────────────────────────────
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [REDIS_URL]},
    }
}

# ── Chat ──────────────────────────────────────────────────
MESSAGE_HISTORY_LIMIT = config("MESSAGE_HISTORY_LIMIT", default=100, cast=int)

# ── DRF ───────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "accounts.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": config("THROTTLE_ANON_RATE", default="20/min"),
        "user": config("THROTTLE_USER_RATE", default="200/min"),
    },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": config("PAGE_SIZE", default=50, cast=int),
    "EXCEPTION_HANDLER": "core.utils.custom_exception_handler",
}

# ── Axes ──────────────────────────────────────────────────
AUTHENTICATION_BACKENDS = [
    "axes.backends.AxesStandaloneBackend",
    "django.contrib.auth.backends.ModelBackend",
]
AXES_FAILURE_LIMIT = config("AXES_FAILURE_LIMIT", default=10, cast=int)
AXES_COOLOFF_TIME = config("AXES_COOLOFF_TIME", default=1, cast=int)
AXES_RESET_ON_SUCCESS = True
AXES_LOCKOUT_PARAMETERS = [["username"], ["ip_address"]]

# ── CORS / CSRF ───────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS", cast=Csv(), default="http://localhost:3000"
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS", cast=Csv(), default="http://localhost:3000"
)
CSRF_COOKIE_SAMESITE = "Lax"
