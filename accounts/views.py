# accounts/views.py

from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from core.responses import success, created
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .services import register_user, login_user, logout_user


def axes_locked_out(request, credentials, *args, **kwargs):
    raise PermissionDenied("Account locked. Try again later.")


class CSRFView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return success({"csrfToken": get_token(request)}, message="CSRF cookie set.")


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        user = register_user(d["username"], d.get("email", ""), d["password"])
        login_user(request, d["username"], d["password"])
        return created(
            {"user": UserSerializer(user).data}, message="Registration successful."
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        s = LoginSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = login_user(
            request, s.validated_data["username"], s.validated_data["password"]
        )
        return success({"user": UserSerializer(user).data}, message="Login successful.")


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout_user(request)
        return success({"detail": "Logged out successfully."})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return success({"user": UserSerializer(request.user).data})
