# accounts/exceptions.py

from core.exceptions import AuthenticationError, ConflictError


class InvalidCredentials(AuthenticationError):
    default_message = "Invalid username or password."


class AccountLocked(AuthenticationError):
    status_code = 403
    default_message = "Account locked due to too many failed attempts. Try again later."


class UserAlreadyExists(ConflictError):
    default_message = "A user with that username already exists."
