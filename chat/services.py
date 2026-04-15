# chat/services.py

from django.utils.text import slugify
from django.db import IntegrityError, transaction
import uuid
from .models import Room, Message
from .exceptions import RoomAlreadyExists


@transaction.atomic
def create_room(user, name: str, is_private: bool = False) -> Room:
    slug = f"{slugify(name)[:100]}-{uuid.uuid4().hex[:6]}"
    try:
        room = Room.objects.create(
            name=name, slug=slug, is_private=is_private, created_by=user
        )
    except IntegrityError:
        raise RoomAlreadyExists()
    room.members.add(user)
    return room


def join_room(room: Room, user) -> None:
    room.members.add(user)


def leave_room(room: Room, user) -> None:
    room.members.remove(user)


def save_message(room: Room, user, content: str) -> Message:
    return Message.objects.create(room=room, sender=user, content=content)
