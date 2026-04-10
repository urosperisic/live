# config/urls.py

from django.conf import settings
from django.conf.urls.static import static

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def _err(msg, status, detail):
    return JsonResponse(
        {
            "ok": False,
            "message": msg,
            "data": None,
            "errors": {"detail": [detail]},
            "meta": None,
        },
        status=status,
    )


def handler404(request, exception=None):
    return _err("Not found.", 404, "The requested URL does not exist.")


def handler500(request):
    return _err("Internal server error.", 500, "An unexpected error occurred.")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/chat/", include("chat.urls")),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
