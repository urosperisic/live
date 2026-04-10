# chat/admin.py

from django.contrib import admin
from .models import Room, Message


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "slug", "is_private", "created_by", "created_at"]
    list_filter = ["is_private"]
    search_fields = ["name", "slug"]
    filter_horizontal = ["members"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "room", "sender", "content", "created_at"]
    list_filter = ["room"]
    search_fields = ["content", "sender__username"]
    raw_id_fields = ["sender", "room"]
