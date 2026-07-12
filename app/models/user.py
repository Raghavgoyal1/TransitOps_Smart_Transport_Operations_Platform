"\"\"\"Pydantic models for TransitOps.\"\"\"
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, ConfigDict
import uuid


def gen_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Base(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")


# ============== AUTH ==============
class RegisterInput(Base):
    name: str
    email: EmailStr
    password: str
    role: str = \"Passenger\"  # Admin | Transport Manager | Dispatcher | Driver | Passenger
    phone: Optional[str] = None


class LoginInput(Base):
    email: EmailStr
    password: str


class TokenOut(Base):
    access_token: str
    token_type: str = \"bearer\"
    user: dict


# ============== USER ==============
class User(Base):
    id: str = Field(default_factory=gen_id)
    name: str
    email: str
    password_hash: str
    role: str = \"Passenger\"
    phone: Optional[str] = None
    avatar: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ============== VEHICLE ==============
class Vehicle(Base):
    id: str = Field(default_factory=gen_id)
    vehicle_number: str
    registration_number: str
    vehicle_type: str = \"Bus\"  # Bus/MiniBus/Truck/Van/ElectricBus
    capacity: int = 40
    fuel_type: str = \"Diesel\"
    current_fuel: float = 100.0  # percent
    mileage: float = 12.0  # km/l
    current_location: Optional[dict] = None  # {lat, lng}
    status: str = \"Available\"  # Available/Running/Maintenance/Inactive
    insurance_expiry: Optional[str] = None
    last_service_date: Optional[str] = None
    next_service_date: Optional[str] = None
    image: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class VehicleCreate(Base):
    vehicle_number: str
    registration_number: str
    vehicle_type: str = \"Bus\"
    capacity: int = 40
    fuel_type: str = \"Diesel\"
    current_fuel: float = 100.0
    mileage: float = 12.0
    status: str = \"Available\"
    insurance_expiry: Optional[str] = None
    last_service_date: Optional[str] = None
    next_service_date: Optional[str] = None
    image: Optional[str] = None


# ============== DRIVER ==============
class Driver(Base):
    id: str = Field(default_factory=gen_id)
    name: str
    age: int = 30
    gender: str = \"Male\"
    phone: str
    email: Optional[str] = None
    license_number: str
    license_expiry: str
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    salary: float = 30000
    joining_date: str = Field(default_factory=now_iso)
    experience_years: float = 2.0
    assigned_vehicle_id: Optional[str] = None
    driving_score: float = 85.0
    status: str = \"Available\"  # Available/Driving/Leave/Suspended
    photo: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class DriverCreate(Base):
    name: str
    age: int = 30
    gender: str = \"Male\"
    phone: str
    email: Optional[str] = None
    license_number: str
    license_expiry: str
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    salary: float = 30000
    experience_years: float = 2.0
    assigned_vehicle_id: Optional[str] = None
    driving_score: float = 85.0
    status: str = \"Available\"
    photo: Optional[str] = None


# ============== ROUTE ==============
class Route(Base):
    id: str = Field(default_factory=gen_id)
    name: str
    start_point: str
    destination: str
    start_coords: dict  # {lat, lng}
    end_coords: dict
    stops: List[dict] = []  # [{name, lat, lng}]
    distance_km: float = 0.0
    travel_time_min: int = 0
    traffic_level: str = \"Low\"  # Low/Medium/High
    fuel_estimate: float = 0.0
    status: str = \"Active\"
    created_at: str = Field(default_factory=now_iso)


class RouteCreate(Base):
    name: str
    start_point: str
    destination: str
    start_coords: dict
    end_coords: dict
    stops: List[dict] = []
    distance_km: float = 0.0
    travel_time_min: int = 0
    traffic_level: str = \"Low\"
    fuel_estimate: float = 0.0


# ============== TRIP ==============
class Trip(Base):
    id: str = Field(default_factory=gen_id)
    trip_code: str
    driver_id: str
    vehicle_id: str
    route_id: str
    scheduled_start: str
    actual_start: Optional[str] = None
    actual_end: Optional[str] = None
    passenger_count: int = 0
    revenue: float = 0.0
    status: str = \"Scheduled\"  # Scheduled/Running/Paused/Completed/Cancelled
    progress: float = 0.0
    current_speed: float = 0.0
    avg_speed: float = 0.0
    delay_min: int = 0
    current_location: Optional[dict] = None
    created_at: str = Field(default_factory=now_iso)


class TripCreate(Base):
    driver_id: str
    vehicle_id: str
    route_id: str
    scheduled_start: str
    passenger_count: int = 0
    revenue: float = 0.0


# ============== FUEL / MAINTENANCE ==============
class FuelLog(Base):
    id: str = Field(default_factory=gen_id)
    vehicle_id: str
    date: str = Field(default_factory=now_iso)
    liters: float
    cost: float
    odometer: float = 0.0
    fuel_type: str = \"Diesel\"
    station: Optional[str] = None


class FuelLogCreate(Base):
    vehicle_id: str
    liters: float
    cost: float
    odometer: float = 0.0
    fuel_type: str = \"Diesel\"
    station: Optional[str] = None


class Maintenance(Base):
    id: str = Field(default_factory=gen_id)
    vehicle_id: str
    type: str = \"Scheduled\"  # Scheduled/Repair/Emergency
    description: str
    cost: float = 0.0
    scheduled_date: str
    completed_date: Optional[str] = None
    mechanic_notes: Optional[str] = None
    parts_changed: List[str] = []
    status: str = \"Pending\"  # Pending/InProgress/Completed


class MaintenanceCreate(Base):
    vehicle_id: str
    type: str = \"Scheduled\"
    description: str
    cost: float = 0.0
    scheduled_date: str
    mechanic_notes: Optional[str] = None
    parts_changed: List[str] = []


# ============== NOTIFICATION ==============
class Notification(Base):
    id: str = Field(default_factory=gen_id)
    user_id: Optional[str] = None  # None = broadcast
    title: str
    message: str
    type: str = \"info\"  # info/warning/success/error
    category: str = \"general\"  # trip/fuel/maintenance/insurance/license/general
    read: bool = False
    created_at: str = Field(default_factory=now_iso)


# ============== CHAT ==============
class ChatMessage(Base):
    id: str = Field(default_factory=gen_id)
    session_id: str
    user_id: str
    role: str  # user | assistant
    content: str
    created_at: str = Field(default_factory=now_iso)


class ChatInput(Base):
    message: str
    session_id: Optional[str] = None
"
