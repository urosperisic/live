# core/exceptions.py


class DomainException(Exception):
    status_code = 400
    default_message = "Domain error."

    def __init__(self, message=None):
        self.message = message or self.default_message
        super().__init__(self.message)


class NotFoundError(DomainException):
    status_code = 404
    default_message = "Not found."


class PermissionError(DomainException):
    status_code = 403
    default_message = "Permission denied."


class AuthenticationError(DomainException):
    status_code = 401
    default_message = "Authentication failed."


class ConflictError(DomainException):
    status_code = 409
    default_message = "Conflict."


class ValidationError(DomainException):
    status_code = 400
    default_message = "Validation error."


class RateLimitError(DomainException):
    status_code = 429
    default_message = "Too many requests. Please slow down."
