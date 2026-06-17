from fastapi import APIRouter, HTTPException, status
from jose import JWTError

from app.auth.schemas import LoginRequest, RefreshRequest, TokenResponse
from app.auth.service import authenticate_user
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse, summary="Authenticate and obtain tokens")
def login(request: LoginRequest):
    """
    Authenticate with **username** and **password**.

    Returns an *access token* (valid for 300 s) and a *refresh token* (valid for 24 h).
    """
    user = authenticate_user(request.username, request.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(user["username"])
    refresh_token = create_refresh_token(user["username"])

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_SECONDS,
    )


@router.post("/refresh", response_model=TokenResponse, summary="Refresh the access token")
def refresh_token(request: RefreshRequest):
    """
    Exchange a valid *refresh token* for a new pair of access / refresh tokens.
    """
    invalid_token_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(request.refresh_token)
    except JWTError:
        raise invalid_token_exc

    username: str | None = payload.get("sub")
    token_type: str | None = payload.get("type")

    if username is None or token_type != "refresh":
        raise invalid_token_exc

    new_access_token = create_access_token(username)
    new_refresh_token = create_refresh_token(username)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_SECONDS,
    )
