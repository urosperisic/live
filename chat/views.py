# chat/views.py

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from core.responses import success, created, no_content
from core.exceptions import NotFoundError
from accounts.permissions import IsAdmin
from .serializers import RoomSerializer, RoomCreateSerializer, MessageSerializer
from .selectors import (
    get_public_rooms,
    get_user_rooms,
    get_room_for_user,
    get_recent_messages,
)
from .services import create_room, join_room, leave_room

User = get_user_model()


class RoomListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request):
        rooms = get_public_rooms() | get_user_rooms(request.user)
        rooms = rooms.distinct()
        return success(RoomSerializer(rooms, many=True).data)

    def post(self, request):
        s = RoomCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        room = create_room(
            user=request.user,
            name=s.validated_data["name"],
            is_private=s.validated_data["is_private"],
        )
        return created(RoomSerializer(room).data, message="Room created.")


class RoomDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        room = get_room_for_user(slug, request.user)
        return success(RoomSerializer(room).data)


class RoomInviteView(APIView):
    """Admin-only: add a user to a private room by username."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, slug):
        room = get_room_for_user(slug, request.user)
        username = request.data.get("username", "").strip()
        if not username:
            from core.exceptions import ValidationError

            raise ValidationError("Username is required.")
        try:
            user = User.objects.get(username=username, is_active=True)
        except User.DoesNotExist:
            raise NotFoundError(f'User "{username}" not found.')
        join_room(room, user)
        return success({"detail": f"{username} added to {room.name}."})


class RoomJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        room = get_room_for_user(slug, request.user)
        join_room(room, request.user)
        return success({"detail": f"Joined room {room.name}."})


class RoomLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        room = get_room_for_user(slug, request.user)
        leave_room(room, request.user)
        return success({"detail": f"Left room {room.name}."})


class MessageHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        room = get_room_for_user(slug, request.user)
        messages = get_recent_messages(room)
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(list(messages), request)
        return success(
            data=MessageSerializer(page, many=True).data,
            meta={
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
            },
        )
