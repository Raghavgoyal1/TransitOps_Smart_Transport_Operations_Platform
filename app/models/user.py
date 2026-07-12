import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.database.session import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATIONS_MANAGER = "operations_manager"
    DISPATCHER = "dispatcher"
    DRIVER = "driver"
    FLEET_MANAGER = "fleet_manager"
    MAINTENANCE_STAFF = "maintenance_staff"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    department = Column(String(100), nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.DRIVER)

    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
