# chat/selectors.py

from django.conf import settings
from django.db.models import Count
from .models import Room, Message
from .exceptions import RoomNotFound, RoomAccessDenied


def _annotate_rooms(qs):
    return qs.annotate(member_count=Count("members", distinct=True))


def get_room_by_slug(slug: str) -> Room:
    try:
        return Room.objects.get(slug=slug)
    except Room.DoesNotExist:
        raise RoomNotFound()


def get_room_for_user(slug: str, user) -> Room:
    room = get_room_by_slug(slug)
    if room.is_private and not room.members.filter(pk=user.pk).exists():
        raise RoomAccessDenied()
    return room


def get_public_rooms():
    return _annotate_rooms(Room.objects.filter(is_private=False))


def get_user_rooms(user):
    return _annotate_rooms(Room.objects.filter(members=user))


# def get_recent_messages(room: Room, limit: int = None):
#     limit = limit or settings.MESSAGE_HISTORY_LIMIT
#     return list(
#         reversed(
#             list(
#                 Message.objects.filter(room=room)
#                 .select_related("sender")
#                 .order_by("-created_at")[:limit]
#             )
#         )
#     )


def get_messages_before(room: Room, before_id: int = None, limit: int = 20):
    """
    Returns `limit` messages older than `before_id`.
    If before_id is not provided — returns the most recent `limit` messages.
    """
    qs = Message.objects.filter(room=room).select_related("sender")
    if before_id:
        qs = qs.filter(id__lt=before_id)
    # Fetch last N (newest first), then reverse for chronological display
    messages = list(qs.order_by("-id")[:limit])
    messages.reverse()
    return messages
