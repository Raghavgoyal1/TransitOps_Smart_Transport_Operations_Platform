"""Seed demo data for TransitOps."""
import asyncio
import random
from datetime import datetime, timezone, timedelta
from db import db
from models import gen_id, now_iso
from auth import hash_password


CITY_COORDS = [
    (\"Downtown Hub\", 40.7128, -74.0060),
    (\"Airport Terminal\", 40.6413, -73.7781),
    (\"North Station\", 40.7580, -73.9855),
    (\"South Park Depot\", 40.6892, -74.0445),
    (\"East Riverside\", 40.7282, -73.9942),
    (\"West Central\", 40.7614, -73.9776),
    (\"Grand Junction\", 40.7484, -73.9857),
    (\"Harbor Point\", 40.7033, -74.0170),
]

VEHICLE_TYPES = [\"Bus\", \"MiniBus\", \"Truck\", \"Van\", \"ElectricBus\"]
FUEL_TYPES = [\"Diesel\", \"Petrol\", \"CNG\", \"Electric\"]
DRIVER_NAMES = [\"James Carter\", \"Maria Rodriguez\", \"Chen Wei\", \"Aisha Patel\", \"David Kim\",
                \"Sophia Muller\", \"Omar Hassan\", \"Elena Petrova\", \"Lucas Silva\", \"Priya Sharma\",
                \"Ryan O'Connor\", \"Yuki Tanaka\", \"Fatima Al-Zahra\", \"Nikolai Ivanov\", \"Zara Ahmed\"]


async def seed():
    print(\"🌱 Seeding TransitOps demo data...\")

    await db.users.delete_many({})
    await db.vehicles.delete_many({})
    await db.drivers.delete_many({})
    await db.routes.delete_many({})
    await db.trips.delete_many({})
    await db.fuel_logs.delete_many({})
    await db.maintenance.delete_many({})
    await db.notifications.delete_many({})
    await db.chat_history.delete_many({})

    # ---- USERS ----
    users = [
        {\"name\": \"Alex Admin\", \"email\": \"admin@transitops.com\", \"role\": \"Admin\", \"password\": \"admin123\"},
        {\"name\": \"Morgan Manager\", \"email\": \"manager@transitops.com\", \"role\": \"Transport Manager\", \"password\": \"manager123\"},
        {\"name\": \"Dana Dispatcher\", \"email\": \"dispatcher@transitops.com\", \"role\": \"Dispatcher\", \"password\": \"dispatch123\"},
        {\"name\": \"Diego Driver\", \"email\": \"driver@transitops.com\", \"role\": \"Driver\", \"password\": \"driver123\"},
        {\"name\": \"Pat Passenger\", \"email\": \"passenger@transitops.com\", \"role\": \"Passenger\", \"password\": \"pass123\"},
    ]
    for u in users:
        await db.users.insert_one({
            \"id\": gen_id(), \"name\": u[\"name\"], \"email\": u[\"email\"], \"role\": u[\"role\"],
            \"password_hash\": hash_password(u[\"password\"]), \"phone\": \"+1-555-\" + str(random.randint(1000, 9999)),
            \"created_at\": now_iso(),
        })
    print(f\"  ✔ {len(users)} users\")

    # ---- VEHICLES ----
    vehicles = []
    for i in range(1, 51):
        vt = random.choice(VEHICLE_TYPES)
        ft = \"Electric\" if vt == \"ElectricBus\" else random.choice(FUEL_TYPES[:3])
        status = random.choices([\"Available\", \"Running\", \"Maintenance\", \"Inactive\"], weights=[40, 35, 15, 10])[0]
        _, lat, lng = random.choice(CITY_COORDS)
        v = {
            \"id\": gen_id(),
            \"vehicle_number\": f\"TO-{1000 + i}\",
            \"registration_number\": f\"NY-{random.randint(10000, 99999)}\",
            \"vehicle_type\": vt,
            \"capacity\": {\"Bus\": 45, \"MiniBus\": 20, \"Truck\": 5, \"Van\": 12, \"ElectricBus\": 40}[vt],
            \"fuel_type\": ft,
            \"current_fuel\": round(random.uniform(15, 100), 1),
            \"mileage\": round(random.uniform(8, 18), 1),
            \"current_location\": {\"lat\": lat + random.uniform(-0.01, 0.01), \"lng\": lng + random.uniform(-0.01, 0.01)},
            \"status\": status,
            \"insurance_expiry\": (datetime.now(timezone.utc) + timedelta(days=random.randint(-20, 400))).isoformat(),
            \"last_service_date\": (datetime.now(timezone.utc) - timedelta(days=random.randint(10, 180))).isoformat(),
            \"next_service_date\": (datetime.now(timezone.utc) + timedelta(days=random.randint(-10, 90))).isoformat(),
            \"image\": None,
            \"created_at\": now_iso(),
        }
        vehicles.append(v)
    await db.vehicles.insert_many(vehicles)
    print(f\"  ✔ {len(vehicles)} vehicles\")

    # ---- DRIVERS ----
    drivers = []
    for i in range(100):
        name = f\"{random.choice(DRIVER_NAMES)} {i+1}\"
        status = random.choices([\"Available\", \"Driving\", \"Leave\", \"Suspended\"], weights=[50, 35, 12, 3])[0]
        d = {
            \"id\": gen_id(),
            \"name\": name,
            \"age\": random.randint(25, 60),
            \"gender\": random.choice([\"Male\", \"Female\"]),
            \"phone\": f\"+1-555-{random.randint(1000, 9999)}\",
            \"email\": f\"driver{i+1}@transitops.com\",
            \"license_number\": f\"DL-{random.randint(100000, 999999)}\",
            \"license_expiry\": (datetime.now(timezone.utc) + timedelta(days=random.randint(-30, 800))).isoformat(),
            \"address\": f\"{random.randint(100, 999)} Main St, NYC\",
            \"emergency_contact\": f\"+1-555-{random.randint(1000, 9999)}\",
            \"salary\": random.randint(28000, 55000),
            \"joining_date\": (datetime.now(timezone.utc) - timedelta(days=random.randint(30, 2000))).isoformat(),
            \"experience_years\": round(random.uniform(1, 15), 1),
            \"assigned_vehicle_id\": random.choice(vehicles)[\"id\"] if random.random() > 0.3 else None,
            \"driving_score\": round(random.uniform(65, 98), 1),
            \"status\": status,
            \"photo\": None,
            \"created_at\": now_iso(),
        }
        drivers.append(d)
    await db.drivers.insert_many(drivers)
    print(f\"  ✔ {len(drivers)} drivers\")

    # ---- ROUTES ----
    routes = []
    for i in range(15):
        start = random.choice(CITY_COORDS)
        end = random.choice([c for c in CITY_COORDS if c != start])
        stops = random.sample([c for c in CITY_COORDS if c not in (start, end)], k=random.randint(1, 3))
        r = {
            \"id\": gen_id(),
            \"name\": f\"{start[0]} → {end[0]}\",
            \"start_point\": start[0],
            \"destination\": end[0],
            \"start_coords\": {\"lat\": start[1], \"lng\": start[2]},
            \"end_coords\": {\"lat\": end[1], \"lng\": end[2]},
            \"stops\": [{\"name\": s[0], \"lat\": s[1], \"lng\": s[2]} for s in stops],
            \"distance_km\": round(random.uniform(8, 45), 1),
            \"travel_time_min\": random.randint(20, 120),
            \"traffic_level\": random.choice([\"Low\", \"Medium\", \"High\"]),
            \"fuel_estimate\": round(random.uniform(3, 12), 1),
            \"status\": \"Active\",
            \"created_at\": now_iso(),
        }
        routes.append(r)
    await db.routes.insert_many(routes)
    print(f\"  ✔ {len(routes)} routes\")

    # ---- TRIPS ----
    trips = []
    for i in range(500):
        v = random.choice(vehicles)
        d = random.choice(drivers)
        r = random.choice(routes)
        status = random.choices([\"Scheduled\", \"Running\", \"Completed\", \"Cancelled\"], weights=[10, 8, 75, 7])[0]
        created = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        t = {
            \"id\": gen_id(),
            \"trip_code\": f\"TRP-{random.randint(100000, 999999)}\",
            \"driver_id\": d[\"id\"],
            \"vehicle_id\": v[\"id\"],
            \"route_id\": r[\"id\"],
            \"scheduled_start\": created.isoformat(),
            \"actual_start\": created.isoformat() if status in (\"Running\", \"Completed\") else None,
            \"actual_end\": (created + timedelta(minutes=r[\"travel_time_min\"])).isoformat() if status == \"Completed\" else None,
            \"passenger_count\": random.randint(0, v[\"capacity\"]),
            \"revenue\": round(random.uniform(50, 800), 2),
            \"status\": status,
            \"progress\": 100.0 if status == \"Completed\" else (random.uniform(10, 90) if status == \"Running\" else 0.0),
            \"current_speed\": round(random.uniform(30, 70), 1) if status == \"Running\" else 0.0,
            \"avg_speed\": round(random.uniform(35, 55), 1),
            \"delay_min\": random.randint(0, 30) if random.random() > 0.7 else 0,
            \"current_location\": r[\"start_coords\"] if status == \"Running\" else None,
            \"created_at\": created.isoformat(),
        }
        trips.append(t)
    await db.trips.insert_many(trips)
    print(f\"  ✔ {len(trips)} trips\")

    # ---- FUEL LOGS ----
    fuel_logs = []
    for _ in range(400):
        v = random.choice(vehicles)
        date = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
        liters = round(random.uniform(20, 120), 1)
        fuel_logs.append({
            \"id\": gen_id(), \"vehicle_id\": v[\"id\"], \"date\": date.isoformat(),
            \"liters\": liters, \"cost\": round(liters * random.uniform(1.3, 1.8), 2),
            \"odometer\": round(random.uniform(10000, 90000), 0),
            \"fuel_type\": v[\"fuel_type\"], \"station\": f\"Station #{random.randint(1, 20)}\",
        })
    await db.fuel_logs.insert_many(fuel_logs)
    print(f\"  ✔ {len(fuel_logs)} fuel logs\")

    # ---- MAINTENANCE ----
    maint = []
    for _ in range(80):
        v = random.choice(vehicles)
        sched = datetime.now(timezone.utc) + timedelta(days=random.randint(-30, 60))
        status = random.choice([\"Pending\", \"InProgress\", \"Completed\"])
        maint.append({
            \"id\": gen_id(), \"vehicle_id\": v[\"id\"], \"type\": random.choice([\"Scheduled\", \"Repair\", \"Emergency\"]),
            \"description\": random.choice([\"Oil change\", \"Brake pad replacement\", \"Tire rotation\", \"Engine diagnostic\", \"AC service\", \"Battery replacement\"]),
            \"cost\": round(random.uniform(80, 2500), 2),
            \"scheduled_date\": sched.isoformat(),
            \"completed_date\": sched.isoformat() if status == \"Completed\" else None,
            \"mechanic_notes\": random.choice([\"All checks passed\", \"Requires follow-up\", \"Parts on order\", \"Completed successfully\", \"\"]),
            \"parts_changed\": random.sample([\"Oil filter\", \"Brake pads\", \"Tires\", \"Battery\", \"Spark plugs\"], k=random.randint(0, 3)),
            \"status\": status,
        })
    await db.maintenance.insert_many(maint)
    print(f\"  ✔ {len(maint)} maintenance records\")

    # ---- NOTIFICATIONS ----
    notifs = [
        {\"title\": \"Vehicle Maintenance Due\", \"message\": \"TO-1023 requires scheduled service in 3 days.\", \"type\": \"warning\", \"category\": \"maintenance\"},
        {\"title\": \"License Expiring Soon\", \"message\": \"Driver James Carter's license expires in 15 days.\", \"type\": \"warning\", \"category\": \"license\"},
        {\"title\": \"Trip Completed\", \"message\": \"Trip TRP-448291 completed successfully with 42 passengers.\", \"type\": \"success\", \"category\": \"trip\"},
        {\"title\": \"Low Fuel Alert\", \"message\": \"3 vehicles have fuel level below 20%.\", \"type\": \"error\", \"category\": \"fuel\"},
        {\"title\": \"New Insurance Policy\", \"message\": \"5 vehicle policies renewed today.\", \"type\": \"info\", \"category\": \"insurance\"},
        {\"title\": \"AI Insight\", \"message\": \"Route optimization saved 45 minutes across today's trips.\", \"type\": \"success\", \"category\": \"general\"},
        {\"title\": \"Delay Reported\", \"message\": \"Trip TRP-559012 is running 18 min late due to traffic.\", \"type\": \"warning\", \"category\": \"trip\"},
    ]
    for n in notifs:
        await db.notifications.insert_one({
            \"id\": gen_id(), \"user_id\": None, \"read\": False,
            \"created_at\": (datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 48))).isoformat(),
            **n,
        })
    print(f\"  ✔ {len(notifs)} notifications\")

    print(\"✅ Seed complete!\")
    print(\"
🔐 Demo credentials:\")
    for u in users:
        print(f\"   {u['role']:20s} → {u['email']} / {u['password']}\")


if __name__ == \"__main__\":
    asyncio.run(seed())
