"""Authentication routes."""
from fastapi import APIRouter, HTTPException, Depends
from db import db
from models import RegisterInput, LoginInput, TokenOut, User, gen_id, now_iso
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix=\"/auth\", tags=[\"auth\"])

VALID_ROLES = {\"Admin\", \"Transport Manager\", \"Dispatcher\", \"Driver\", \"Passenger\"}


@router.post(\"/register\", response_model=TokenOut)
async def register(data: RegisterInput):
    if data.role not in VALID_ROLES:
        raise HTTPException(400, \"Invalid role\")
    existing = await db.users.find_one({\"email\": data.email.lower()})
    if existing:
        raise HTTPException(400, \"Email already registered\")
    user = User(
        name=data.name,
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        role=data.role,
        phone=data.phone,
    )
    await db.users.insert_one(user.model_dump())
    token = create_access_token({
        \"sub\": user.id, \"email\": user.email, \"role\": user.role, \"name\": user.name
    })
    return TokenOut(access_token=token, user={
        \"id\": user.id, \"name\": user.name, \"email\": user.email, \"role\": user.role
    })


@router.post(\"/login\", response_model=TokenOut)
async def login(data: LoginInput):
    user = await db.users.find_one({\"email\": data.email.lower()}, {\"_id\": 0})
    if not user or not verify_password(data.password, user[\"password_hash\"]):
        raise HTTPException(401, \"Invalid credentials\")
    token = create_access_token({
        \"sub\": user[\"id\"], \"email\": user[\"email\"], \"role\": user[\"role\"], \"name\": user[\"name\"]
    })
    return TokenOut(access_token=token, user={
        \"id\": user[\"id\"], \"name\": user[\"name\"], \"email\": user[\"email\"], \"role\": user[\"role\"]
    })


@router.get(\"/me\")
async def me(user: dict = Depends(get_current_user)):
    doc = await db.users.find_one({\"id\": user[\"id\"]}, {\"_id\": 0, \"password_hash\": 0})
    return doc
