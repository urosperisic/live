# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.core.cache import cache
from django.conf import settings
from .models import Room, Message
from .services import save_message

_WS_RATE_LIMIT = 10  # max messages per window
_WS_RATE_WINDOW = 10  # seconds


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for a single chat room.

    URL: /ws/chat/<room_slug>/

    Lifecycle:
      connect    → authenticate → join channel group → send message history
      receive    → save to DB → broadcast to group
      disconnect → leave channel group

    Groups:
      room_{slug} — all connected clients in the same room share this group.
    """

    async def connect(self):
        user = self.scope.get("user")

        # Reject anonymous connections immediately
        if not user or isinstance(user, AnonymousUser):
            await self.close(code=4001)
            return

        self.room_slug = self.scope["url_route"]["kwargs"]["room_slug"]
        self.group_name = f"room_{self.room_slug}"
        self.user = user

        # Verify room access (DB check)
        self.room = await self._get_room()
        if self.room is None:
            await self.close(code=4004)
            return

        # Join channel group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send recent message history to this client only
        await self._send_history()

        # Notify room of new online user
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "user.join", "username": user.username},
        )

    async def disconnect(self, code):
        if not hasattr(self, "group_name"):
            return
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "user.leave", "username": self.user.username},
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            content = data.get("content", "").strip()
        except (json.JSONDecodeError, AttributeError):
            await self._send_error("Invalid message format.")
            return

        if not content:
            await self._send_error("Message cannot be empty.")
            return

        if len(content) > 4096:
            await self._send_error("Message too long.")
            return

        if not await self._check_rate_limit():
            await self._send_error("Slow down — too many messages.")
            return

        msg = await self._save_message(content)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "id": msg.id,
                "sender": self.user.username,
                "sender_id": self.user.id,
                "content": content,
                "created_at": msg.created_at.isoformat(),
            },
        )

    # ── Group event handlers ───────────────────────────────

    async def chat_message(self, event):
        """Broadcast a new chat message to this WebSocket."""
        await self.send(
            text_data=json.dumps(
                {
                    "type": "message",
                    "id": event["id"],
                    "sender": event["sender"],
                    "sender_id": event["sender_id"],
                    "content": event["content"],
                    "created_at": event["created_at"],
                }
            )
        )

    async def user_join(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_join",
                    "username": event["username"],
                }
            )
        )

    async def user_leave(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_leave",
                    "username": event["username"],
                }
            )
        )

    # ── Helpers ───────────────────────────────────────────

    @database_sync_to_async
    def _get_room(self):
        try:
            room = Room.objects.get(slug=self.room_slug)
            if room.is_private and not room.members.filter(pk=self.user.pk).exists():
                return None
            return room
        except Room.DoesNotExist:
            return None

    @database_sync_to_async
    def _save_message(self, content: str) -> Message:
        return save_message(self.room, self.user, content)

    @database_sync_to_async
    def _get_history(self):
        from .selectors import get_recent_messages
        from .serializers import MessageSerializer

        msgs = get_recent_messages(self.room)
        return MessageSerializer(msgs, many=True).data

    async def _send_history(self):
        history = await self._get_history()
        await self.send(
            text_data=json.dumps(
                {
                    "type": "history",
                    "messages": list(history),
                }
            )
        )

    async def _send_error(self, detail: str):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "error",
                    "detail": detail,
                }
            )
        )

    async def _check_rate_limit(self) -> bool:
        key = f"ws_rate:{self.user.id}"
        count = cache.get(key, 0)
        if count >= _WS_RATE_LIMIT:
            return False
        cache.set(key, count + 1, timeout=_WS_RATE_WINDOW)
        return True
