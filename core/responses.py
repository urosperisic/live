# core/responses.py

from rest_framework.response import Response
from rest_framework import status as http_status


def _env(ok, message, data=None, errors=None, meta=None):
    return {"ok": ok, "message": message, "data": data, "errors": errors, "meta": meta}


def success(data=None, message="OK.", status=http_status.HTTP_200_OK, meta=None):
    return Response(_env(True, message, data=data, meta=meta), status=status)


def created(data=None, message="Created."):
    return success(data, message, http_status.HTTP_201_CREATED)


def no_content():
    return Response(status=http_status.HTTP_204_NO_CONTENT)


def error(message="Error.", errors=None, status=http_status.HTTP_400_BAD_REQUEST):
    return Response(_env(False, message, errors=errors), status=status)
