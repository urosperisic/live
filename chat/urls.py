# chat/urls.py

from django.urls import path
from .views import (
    RoomListCreateView,
    RoomDetailView,
    RoomInviteView,
    RoomJoinView,
    RoomLeaveView,
    MessageHistoryView,
)

urlpatterns = [
    path("rooms/", RoomListCreateView.as_view()),
    path("rooms/<slug:slug>/", RoomDetailView.as_view()),
    path("rooms/<slug:slug>/invite/", RoomInviteView.as_view()),
    path("rooms/<slug:slug>/join/", RoomJoinView.as_view()),
    path("rooms/<slug:slug>/leave/", RoomLeaveView.as_view()),
    path("rooms/<slug:slug>/messages/", MessageHistoryView.as_view()),
]
