# accounts/services.py

from __future__ import annotations

from typing import TYPE_CHECKING, Any
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db import IntegrityError
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from .exceptions import InvalidCredentials, AccountLocked, UserAlreadyExists

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractBaseUser as User
else:
    User = get_user_model()


def register_user(username: str, email: str, password: str) -> User:
    try:
        return User.objects.create_user(
            username=username, email=email, password=password
        )
    except IntegrityError:
        raise UserAlreadyExists()


def login_user(request, username: str, password: str) -> User:
    try:
        user = authenticate(request, username=username, password=password)
    except DjangoPermissionDenied:
        raise AccountLocked()
    if user is None:
        raise InvalidCredentials()
    login(request, user)
    return user


def logout_user(request) -> None:
    logout(request)
