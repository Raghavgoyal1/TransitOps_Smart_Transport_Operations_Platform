"""Fleet management routes: vehicles, drivers, routes, trips, fuel, maintenance."""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from db import db
from auth import get_current_user
from models import (
    Vehicle, VehicleCreate, Driver, DriverCreate, Route, RouteCreate,
    Trip, TripCreate, FuelLog, FuelLogCreate, Maintenance, MaintenanceCreate,
    now_iso, gen_id
)

router = APIRouter(tags=[\"fleet\"])


# -------- VEHICLES --------
@router.get(\"/vehicles\")
async def list_vehicles(status: Optional[str] = None, user=Depends(get_current_user)):
    q = {\"status\": status} if status else {}
    items = await db.vehicles.find(q, {\"_id\": 0}).to_list(500)
    return items


@router.post(\"/vehicles\")
async def create_vehicle(data: VehicleCreate, user=Depends(get_current_user)):
    v = Vehicle(**data.model_dump())
    await db.vehicles.insert_one(v.model_dump())
    return v


@router.get(\"/vehicles/{vid}\")
async def get_vehicle(vid: str, user=Depends(get_current_user)):
    v = await db.vehicles.find_one({\"id\": vid}, {\"_id\": 0})
    if not v:
        raise HTTPException(404, \"Not found\")
    return v


@router.put(\"/vehicles/{vid}\")
async def update_vehicle(vid: str, data: dict, user=Depends(get_current_user)):
    data.pop(\"id\", None)
    data.pop(\"_id\", None)
    await db.vehicles.update_one({\"id\": vid}, {\"$set\": data})
    return await db.vehicles.find_one({\"id\": vid}, {\"_id\": 0})


@router.delete(\"/vehicles/{vid}\")
async def delete_vehicle(vid: str, user=Depends(get_current_user)):
    await db.vehicles.delete_one({\"id\": vid})
    return {\"ok\": True}


# -------- DRIVERS --------
@router.get(\"/drivers\")
async def list_drivers(status: Optional[str] = None, user=Depends(get_current_user)):
    q = {\"status\": status} if status else {}
    return await db.drivers.find(q, {\"_id\": 0}).to_list(500)


@router.post(\"/drivers\")
async def create_driver(data: DriverCreate, user=Depends(get_current_user)):
    d = Driver(**data.model_dump())
    await db.drivers.insert_one(d.model_dump())
    return d


@router.get(\"/drivers/{did}\")
async def get_driver(did: str, user=Depends(get_current_user)):
    d = await db.drivers.find_one({\"id\": did}, {\"_id\": 0})
    if not d:
        raise HTTPException(404, \"Not found\")
    return d


@router.put(\"/drivers/{did}\")
async def update_driver(did: str, data: dict, user=Depends(get_current_user)):
    data.pop(\"id\", None)
    data.pop(\"_id\", None)
    await db.drivers.update_one({\"id\": did}, {\"$set\": data})
    return await db.drivers.find_one({\"id\": did}, {\"_id\": 0})


@router.delete(\"/drivers/{did}\")
async def delete_driver(did: str, user=Depends(get_current_user)):
    await db.drivers.delete_one({\"id\": did})
    return {\"ok\": True}


# -------- ROUTES --------
@router.get(\"/routes\")
async def list_routes(user=Depends(get_current_user)):
    return await db.routes.find({}, {\"_id\": 0}).to_list(500)


@router.post(\"/routes\")
async def create_route(data: RouteCreate, user=Depends(get_current_user)):
    r = Route(**data.model_dump())
    await db.routes.insert_one(r.model_dump())
    return r


@router.get(\"/routes/{rid}\")
async def get_route(rid: str, user=Depends(get_current_user)):
    r = await db.routes.find_one({\"id\": rid}, {\"_id\": 0})
    if not r:
        raise HTTPException(404, \"Not found\")
    return r


@router.put(\"/routes/{rid}\")
async def update_route(rid: str, data: dict, user=Depends(get_current_user)):
    data.pop(\"id\", None)
    data.pop(\"_id\", None)
    await db.routes.update_one({\"id\": rid}, {\"$set\": data})
    return await db.routes.find_one({\"id\": rid}, {\"_id\": 0})


@router.delete(\"/routes/{rid}\")
async def delete_route(rid: str, user=Depends(get_current_user)):
    await db.routes.delete_one({\"id\": rid})
    return {\"ok\": True}


# -------- TRIPS --------
@router.get(\"/trips\")
async def list_trips(status: Optional[str] = None, user=Depends(get_current_user)):
    q = {\"status\": status} if status else {}
    return await db.trips.find(q, {\"_id\": 0}).sort(\"created_at\", -1).to_list(500)


@router.post(\"/trips\")
async def create_trip(data: TripCreate, user=Depends(get_current_user)):
    import random, string
    code = \"TRP-\" + \"\".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    t = Trip(trip_code=code, **data.model_dump())
    await db.trips.insert_one(t.model_dump())
    return t


@router.get(\"/trips/{tid}\")
async def get_trip(tid: str, user=Depends(get_current_user)):
    t = await db.trips.find_one({\"id\": tid}, {\"_id\": 0})
    if not t:
        raise HTTPException(404, \"Not found\")
    return t


@router.put(\"/trips/{tid}\")
async def update_trip(tid: str, data: dict, user=Depends(get_current_user)):
    data.pop(\"id\", None)
    data.pop(\"_id\", None)
    await db.trips.update_one({\"id\": tid}, {\"$set\": data})
    return await db.trips.find_one({\"id\": tid}, {\"_id\": 0})


@router.post(\"/trips/{tid}/action\")
async def trip_action(tid: str, body: dict, user=Depends(get_current_user)):
    action = body.get(\"action\")
    updates = {}
    if action == \"start\":
        updates = {\"status\": \"Running\", \"actual_start\": now_iso()}
    elif action == \"pause\":
        updates = {\"status\": \"Paused\"}
    elif action == \"resume\":
        updates = {\"status\": \"Running\"}
    elif action == \"complete\":
        updates = {\"status\": \"Completed\", \"actual_end\": now_iso(), \"progress\": 100.0}
    elif action == \"cancel\":
        updates = {\"status\": \"Cancelled\"}
    await db.trips.update_one({\"id\": tid}, {\"$set\": updates})
    return await db.trips.find_one({\"id\": tid}, {\"_id\": 0})


@router.delete(\"/trips/{tid}\")
async def delete_trip(tid: str, user=Depends(get_current_user)):
    await db.trips.delete_one({\"id\": tid})
    return {\"ok\": True}


# -------- FUEL --------
@router.get(\"/fuel\")
async def list_fuel(vehicle_id: Optional[str] = None, user=Depends(get_current_user)):
    q = {\"vehicle_id\": vehicle_id} if vehicle_id else {}
    return await db.fuel_logs.find(q, {\"_id\": 0}).sort(\"date\", -1).to_list(500)


@router.post(\"/fuel\")
async def create_fuel(data: FuelLogCreate, user=Depends(get_current_user)):
    f = FuelLog(**data.model_dump())
    await db.fuel_logs.insert_one(f.model_dump())
    return f


# -------- MAINTENANCE --------
@router.get(\"/maintenance\")
async def list_maintenance(status: Optional[str] = None, user=Depends(get_current_user)):
    q = {\"status\": status} if status else {}
    return await db.maintenance.find(q, {\"_id\": 0}).sort(\"scheduled_date\", -1).to_list(500)


@router.post(\"/maintenance\")
async def create_maintenance(data: MaintenanceCreate, user=Depends(get_current_user)):
    m = Maintenance(**data.model_dump())
    await db.maintenance.insert_one(m.model_dump())
    return m


@router.put(\"/maintenance/{mid}\")
async def update_maintenance(mid: str, data: dict, user=Depends(get_current_user)):
    data.pop(\"id\", None)
    data.pop(\"_id\", None)
    await db.maintenance.update_one({\"id\": mid}, {\"$set\": data})
    return await db.maintenance.find_one({\"id\": mid}, {\"_id\": 0})
