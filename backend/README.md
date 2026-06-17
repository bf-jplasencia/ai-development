# JWT Authentication API

FastAPI application that demonstrates a complete JWT authentication flow using **access tokens** (5-minute TTL) and **refresh tokens** (24-hour TTL). Passwords are hashed with **bcrypt** via `passlib`. Dependency management is handled by **Poetry**.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Endpoints](#endpoints)
- [Prerequisites](#prerequisites)
- [Local Development (Poetry)](#local-development-poetry)
- [Docker Deployment](#docker-deployment)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Security Notes](#security-notes)

---

## Architecture

```
┌──────────────┐        POST /auth/login         ┌──────────────────────┐
│    Client    │ ──────────────────────────────► │   FastAPI Backend     │
│              │ ◄──────────────────────────────  │  • Validates creds   │
│              │   { access_token, refresh_token }│  • Issues JWT tokens │
│              │                                  └──────────────────────┘
│              │        POST /auth/refresh
│              │ ──────────────────────────────►  Validates refresh token
│              │ ◄──────────────────────────────  Issues new token pair
└──────────────┘
```

**Token lifetimes**

| Token type    | TTL        |
|---------------|------------|
| Access token  | 300 seconds (5 min) |
| Refresh token | 86 400 seconds (24 h) |

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI application entry point
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── router.py         # /auth/login and /auth/refresh endpoints
│   │   ├── schemas.py        # Pydantic request/response models
│   │   └── service.py        # User lookup & password verification
│   └── core/
│       ├── __init__.py
│       ├── config.py         # Application settings (pydantic-settings)
│       └── security.py       # JWT creation/decoding, bcrypt hashing
├── .env.example              # Environment variable template
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml            # Poetry dependencies
└── README.md
```

---

## Endpoints

### `GET /health`
Health-check probe. Returns `{"status": "healthy"}`.

---

### `POST /auth/login`
Authenticate with username and password. Returns an access token and a refresh token.

**Request body (JSON)**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response `200 OK`**
```json
{
  "access_token": "<JWT>",
  "refresh_token": "<JWT>",
  "token_type": "bearer",
  "expires_in": 300
}
```

**Response `401 Unauthorized`** — wrong credentials.

---

### `POST /auth/refresh`
Exchange a valid refresh token for a fresh pair of tokens.

**Request body (JSON)**
```json
{
  "refresh_token": "<JWT>"
}
```

**Response `200 OK`**
```json
{
  "access_token": "<new JWT>",
  "refresh_token": "<new JWT>",
  "token_type": "bearer",
  "expires_in": 300
}
```

**Response `401 Unauthorized`** — token is invalid, expired, or not a refresh token.

---

### Interactive API Docs
Once the server is running, visit:

- Swagger UI → [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc → [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Python | 3.11 |
| Poetry | 1.8 |
| Docker | 24 |
| Docker Compose | v2 |

---

## Local Development (Poetry)

### 1. Install dependencies

```bash
cd backend
poetry install
```

### 2. (Optional) Copy the environment file

```bash
cp .env.example .env
# Edit .env and set a strong SECRET_KEY
```

### 3. Run the development server

```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

---

## Docker Deployment

### Build and start

```bash
cd backend
docker compose up --build -d
```

### Stop

```bash
docker compose down
```

### View logs

```bash
docker compose logs -f backend
```

> **Note:** Before building for the first time, generate the lock file locally if it does not exist:
> ```bash
> poetry lock
> ```
> The `poetry.lock` file is copied into the image to guarantee reproducible builds.

---

## Configuration

All settings are managed via environment variables (or a `.env` file at project root).

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `change-this-...` | HMAC signing key for JWTs — **must** be changed in production |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_SECONDS` | `300` | Access token lifetime in seconds |
| `REFRESH_TOKEN_EXPIRE_SECONDS` | `86400` | Refresh token lifetime in seconds |

Generate a strong secret key:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Usage Examples

### Login

```bash
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | python -m json.tool
```

### Refresh

```bash
curl -s -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "<refresh_token_from_login>"}' | python -m json.tool
```

---

## Security Notes

- **`SECRET_KEY`** — never commit a real secret to version control. Use Docker secrets, AWS Secrets Manager, Azure Key Vault, or a similar solution in production.
- **User store** — the in-memory `_USERS_DB` dictionary in `app/auth/service.py` is for demonstration only. Replace it with a proper database (PostgreSQL, etc.) and a secure user management layer before deploying to production.
- **HTTPS** — always run behind TLS (e.g., an Nginx reverse proxy with a valid certificate) in production so that tokens are never transmitted in plain text.
- **bcrypt version** — `passlib 1.7.x` is not compatible with `bcrypt 4.x` or higher. The `pyproject.toml` pins `bcrypt = ">=3.2,<4.0"` to avoid this known incompatibility.
