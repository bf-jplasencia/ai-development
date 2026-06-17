from typing import Optional

from app.core.security import get_password_hash, verify_password

# In-memory user store — replace with a real database in production.
# The password hash is generated at startup from the plain-text default.
_USERS_DB: dict[str, dict] = {
    "admin": {
        "username": "admin",
        "hashed_password": get_password_hash("admin123"),
    }
}


def authenticate_user(username: str, password: str) -> Optional[dict]:
    user = _USERS_DB.get(username)
    if user is None:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user
