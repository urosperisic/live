#!/usr/bin/env python
"""
Full API test script — handles CSRF tokens automatically.
Usage: python test_api.py
"""

import requests
import json
from urllib.parse import urljoin

BASE_URL = "http://127.0.0.1:8000"

session = requests.Session()
session.headers.update({"Content-Type": "application/json"})

# Store room slug for later use
ROOM_SLUG = None


def get_csrf_token():
    """Get CSRF token from API."""
    resp = session.get(urljoin(BASE_URL, "/api/auth/csrf/"))
    resp.raise_for_status()
    token = resp.json()["data"].get("csrfToken", "")
    print(f"✓ CSRF Token: {token[:20]}...")
    session.headers.update({"X-CSRFToken": token})
    return token


def test_register():
    """Test user registration."""
    print("\n1 ----------  REGISTER")
    get_csrf_token()

    data = {
        "username": "john",
        "email": "john@example.com",
        "password": "pass1234",
        "password2": "pass1234",
    }
    resp = session.post(urljoin(BASE_URL, "/api/auth/register/"), json=data)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))
    return resp.status_code == 201


def test_login():
    """Test user login."""
    print("\n2 ----------  LOGIN")
    get_csrf_token()

    data = {"username": "john", "password": "pass1234"}
    resp = session.post(urljoin(BASE_URL, "/api/auth/login/"), json=data)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))
    return resp.status_code == 200


def test_create_room():
    """Test room creation."""
    global ROOM_SLUG
    print("\n3 ----------  CREATE ROOM")
    get_csrf_token()

    data = {
        "name": "General",
        "slug": "general",
        "is_private": False,
    }
    resp = session.post(urljoin(BASE_URL, "/api/chat/rooms/"), json=data)
    print(f"Status: {resp.status_code}")
    result = resp.json()
    print(json.dumps(result, indent=2))

    # Store slug for later use
    if resp.status_code in [200, 201] and result.get("data"):
        ROOM_SLUG = result["data"].get("slug")
        print(f"✓ Room slug: {ROOM_SLUG}")

    return result if resp.status_code in [200, 201] else None


def test_list_rooms():
    """Test listing rooms."""
    global ROOM_SLUG
    print("\n4 ----------  LIST ROOMS")
    resp = session.get(urljoin(BASE_URL, "/api/chat/rooms/"))
    print(f"Status: {resp.status_code}")
    result = resp.json()
    print(json.dumps(result, indent=2))

    # Store first room slug if not already stored
    if not ROOM_SLUG and result.get("data"):
        ROOM_SLUG = result["data"][0].get("slug")
        print(f"✓ Using room slug: {ROOM_SLUG}")

    return result.get("data", [])


def test_room_messages():
    """Test getting room messages."""
    global ROOM_SLUG
    print(f"\n5 ----------  GET MESSAGES ({ROOM_SLUG})")
    if not ROOM_SLUG:
        print("----------  No room slug available")
        return None
    resp = session.get(urljoin(BASE_URL, f"/api/chat/rooms/{ROOM_SLUG}/messages/"))
    print(f"Status: {resp.status_code}")
    result = resp.json()
    print(json.dumps(result, indent=2))
    return result


def test_join_room():
    """Test joining a room."""
    global ROOM_SLUG
    print(f"\n6 ----------  JOIN ROOM ({ROOM_SLUG})")
    if not ROOM_SLUG:
        print("----------  No room slug available")
        return False
    get_csrf_token()

    resp = session.post(urljoin(BASE_URL, f"/api/chat/rooms/{ROOM_SLUG}/join/"))
    print(f"Status: {resp.status_code}")
    result = resp.json()
    print(json.dumps(result, indent=2))
    return resp.status_code in [200, 201]


def test_logout():
    """Test logout."""
    print("\n7 ----------  LOGOUT")
    get_csrf_token()

    resp = session.post(urljoin(BASE_URL, "/api/auth/logout/"))
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))
    return resp.status_code == 200


def main():
    print("---------- Starting API Tests...\n")

    try:
        # Register (might fail if user exists)
        test_register()

        # Login
        test_login()

        # Create room
        room = test_create_room()

        # List rooms
        rooms = test_list_rooms()

        # Get messages
        test_room_messages()

        # Join room
        test_join_room()

        # Logout
        test_logout()

        print("\n---------- All tests completed!")

    except Exception as e:
        print(f"\n---------- Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
