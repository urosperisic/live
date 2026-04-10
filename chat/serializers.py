# chat/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Room, Message

User = get_user_model()


class RoomSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source="created_by.username")
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            "id",
            "name",
            "slug",
            "is_private",
            "created_by",
            "member_count",
            "created_at",
        ]
        read_only_fields = ["id", "slug", "created_by", "member_count", "created_at"]

    def get_member_count(self, obj):
        return obj.members.count()


class RoomCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    is_private = serializers.BooleanField(default=False)


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.ReadOnlyField(source="sender.username")
    sender_id = serializers.ReadOnlyField(source="sender.id")

    class Meta:
        model = Message
        fields = ["id", "sender", "sender_id", "content", "created_at"]
        read_only_fields = ["id", "sender", "sender_id", "created_at"]
