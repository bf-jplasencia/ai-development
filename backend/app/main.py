from fastapi import FastAPI

from app.auth.router import router as auth_router

app = FastAPI(
    title="JWT Authentication API",
    description="FastAPI application showcasing JWT-based authentication with access and refresh tokens.",
    version="0.1.0",
)

app.include_router(auth_router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}
