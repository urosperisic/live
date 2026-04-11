# accounts/selectors.py

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser
from core.exceptions import NotFoundError

User = get_user_model()


def get_user_by_id(user_id: int) -> AbstractBaseUser | None:
    try:
        return User.objects.get(pk=user_id, is_active=True)
    except User.DoesNotExist:
        return None


def get_user_by_username(username: str) -> AbstractBaseUser:
    try:
        return User.objects.get(username=username, is_active=True)
    except User.DoesNotExist:
        raise NotFoundError(f'User "{username}" not found.')
