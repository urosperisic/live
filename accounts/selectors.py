# accounts/selectors.py

from django.contrib.auth import get_user_model

User = get_user_model()


def get_user_by_id(user_id: int):
    try:
        return User.objects.get(pk=user_id, is_active=True)
    except User.DoesNotExist:
        return None
