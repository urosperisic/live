# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django_redis import get_redis_connection
from .models import Room, Message
from .services import save_message

_WS_RATE_LIMIT = 10  # max messages per window
_WS_RATE_WINDOW = 10  # seconds


def _presence_key(room_slug: str) -> str:
    return f"online:{room_slug}"


def _decode_online(members: set) -> list:
    """smembers returns bytes — decode to str for JSON serialization."""  # CHANGED
    return [u.decode() if isinstance(u, bytes) else u for u in members]  # CHANGED


class ChatConsumer(AsyncWebsocketConsumer):
    @property
    def redis(self):
        return get_redis_connection("default")

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

        self.redis.sadd(_presence_key(self.room_slug), self.user.username)

        # Send recent message history to this client only
        await self._send_history()

        # Send current online list to this client only
        await self._send_presence()

        online = _decode_online(
            self.redis.smembers(_presence_key(self.room_slug)) or set()
        )  # CHANGED
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "user.join",
                "username": user.username,
                "online": online,
            },  # CHANGED
        )

    async def disconnect(self, code):
        if not hasattr(self, "group_name"):
            return
        self.redis.srem(_presence_key(self.room_slug), self.user.username)
        online = _decode_online(
            self.redis.smembers(_presence_key(self.room_slug)) or set()
        )  # CHANGED
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "user.leave",
                "username": self.user.username,
                "online": online,  # CHANGED
            },
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
                    "online": event["online"],
                }
            )
        )

    async def user_leave(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_leave",
                    "username": event["username"],
                    "online": event["online"],
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

    # CHANGED: uses get_messages_before, returns messages + meta ↓
    @database_sync_to_async
    def _get_history(self):
        from .selectors import get_messages_before
        from .serializers import MessageSerializer

        msgs = get_messages_before(self.room, limit=20)
        serialized = MessageSerializer(msgs, many=True).data
        has_more = len(msgs) == 20
        oldest_id = msgs[0].id if msgs else None
        return list(serialized), {"has_more": has_more, "oldest_id": oldest_id}

    # CHANGED: sends meta alongside messages ↓
    async def _send_history(self):
        messages, meta = await self._get_history()
        await self.send(
            text_data=json.dumps(
                {
                    "type": "history",
                    "messages": messages,
                    "meta": meta,  # has_more + oldest_id
                }
            )
        )

    async def _send_presence(self):
        online = _decode_online(
            self.redis.smembers(_presence_key(self.room_slug)) or set()
        )  # CHANGED
        await self.send(
            text_data=json.dumps(
                {
                    "type": "presence",
                    "online": online,  # CHANGED
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
        key = f"ws_rate:{self.user.id}:{self.room_slug}"
        try:
            count = self.redis.incr(key)
            if count == 1:
                self.redis.expire(key, _WS_RATE_WINDOW)
        except Exception:
            return True
        return count <= _WS_RATE_LIMIT
