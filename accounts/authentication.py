# accounts/authentication.py

from rest_framework.authentication import SessionAuthentication as _DRFSessionAuth


class SessionAuthentication(_DRFSessionAuth):
    """Thin wrapper — swap easily if auth strategy changes."""

    pass
