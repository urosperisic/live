# chat/exceptions.py

from core.exceptions import NotFoundError, PermissionError, ConflictError


class RoomNotFound(NotFoundError):
    default_message = "Room not found."


class RoomAlreadyExists(ConflictError):
    default_message = "A room with that name already exists."


class RoomAccessDenied(PermissionError):
    default_message = "You do not have access to this room."
