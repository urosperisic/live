# core/utils.py

import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from core.exceptions import DomainException

logger = logging.getLogger(__name__)


def _normalize(data):
    if isinstance(data, dict):
        return {
            k: [str(i) for i in v] if isinstance(v, list) else [str(v)]
            for k, v in data.items()
        }
    if isinstance(data, list):
        return {"non_field_errors": [str(i) for i in data]}
    if data is None:
        return None
    return {"detail": [str(data)]}


def custom_exception_handler(exc, context):
    req = context.get("request")

    if isinstance(exc, DomainException):
        return Response(
            {
                "ok": False,
                "message": exc.message,
                "data": None,
                "errors": {"detail": [exc.message]},
                "meta": None,
            },
            status=exc.status_code,
        )

    response = exception_handler(exc, context)
    if response is not None:
        if response.status_code == 429:
            message = "Too many requests."
        elif response.status_code in (401, 403):
            message = str(response.data.get("detail", "Auth error."))
        elif isinstance(response.data, dict) and "detail" not in response.data:
            message = "Invalid input data."
        else:
            message = str(response.data.get("detail", "Request failed."))
        response.data = {
            "ok": False,
            "message": message,
            "data": None,
            "errors": _normalize(response.data),
            "meta": None,
        }
        return response

    logger.exception(
        "Unhandled error: %s",
        exc,
        extra={
            "path": getattr(req, "path", None),
            "method": getattr(req, "method", None),
        },
    )
    return Response(
        {
            "ok": False,
            "message": "Internal server error.",
            "data": None,
            "errors": {"detail": ["An unexpected error occurred."]},
            "meta": None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
