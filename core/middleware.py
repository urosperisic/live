# core/middleware.py

from django.http import JsonResponse
from django.core.exceptions import PermissionDenied
from core.exceptions import DomainException


def _json_err(message, status, detail=None):
    return JsonResponse(
        {
            "ok": False,
            "message": message,
            "data": None,
            "errors": {"detail": [detail or message]},
            "meta": None,
        },
        status=status,
    )


class DomainExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            return self.get_response(request)
        except DomainException as exc:
            return _json_err(exc.message, exc.status_code)
        except PermissionDenied:
            return _json_err(
                "Account locked due to too many failed attempts. Try again later.",
                403,
                "Account temporarily locked.",
            )
