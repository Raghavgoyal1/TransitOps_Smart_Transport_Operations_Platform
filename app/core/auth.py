import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = os.environ.get(\"JWT_SECRET\", \"dev-secret\")
JWT_ALGO = os.environ.get(\"JWT_ALGORITHM\", \"HS256\")
JWT_EXP_MIN = int(os.environ.get(\"JWT_EXP_MINUTES\", \"1440\"))

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(\"utf-8\"), bcrypt.gensalt()).decode(\"utf-8\")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(\"utf-8\"), hashed.encode(\"utf-8\"))
    except Exception:
        return False


def create_access_token(payload: dict, expires_minutes: Optional[int] = None) -> str:
    to_encode = payload.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes or JWT_EXP_MIN)
    to_encode.update({\"exp\": expire, \"iat\": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGO)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail=\"Token expired\")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail=\"Invalid token\")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail=\"Not authenticated\")
    payload = decode_token(credentials.credentials)
    return {
        \"id\": payload.get(\"sub\"),
        \"email\": payload.get(\"email\"),
        \"role\": payload.get(\"role\"),
        \"name\": payload.get(\"name\"),
    }


def require_roles(*roles):
    async def _guard(user: dict = Depends(get_current_user)):
        if user[\"role\"] not in roles:
            raise HTTPException(status_code=403, detail=\"Insufficient permissions\")
        return user
    return _guard
