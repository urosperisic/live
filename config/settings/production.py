# config/settings/production.py

from .base import *  # noqa
from decouple import config as _cfg

DEBUG = False

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": _cfg("POSTGRES_DB"),
        "USER": _cfg("POSTGRES_USER"),
        "PASSWORD": _cfg("POSTGRES_PASSWORD"),
        "HOST": _cfg("POSTGRES_HOST", default="localhost"),
        "PORT": _cfg("POSTGRES_PORT", default="5432"),
        "CONN_MAX_AGE": 60,
    }
}

SESSION_COOKIE_SECURE = True

SECURE_HSTS_SECONDS = 31_536_000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True
CSRF_COOKIE_SECURE = True

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
        },
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "json"},
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "django.security": {"level": "WARNING", "propagate": True},
        "django.request": {"level": "ERROR", "propagate": True},
    },
}
