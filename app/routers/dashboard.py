"""Dashboard, analytics, notifications, AI routes."""
import os
import random
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from db import db
from auth import get_current_user
from models import Notification, ChatInput, gen_id, now_iso

router = APIRouter(tags=[\"dashboard\"])


@router.get(\"/dashboard/stats\")
async def dashboard_stats(user=Depends(get_current_user)):
    vehicles = await db.vehicles.find({}, {\"_id\": 0}).to_list(1000)
    drivers = await db.drivers.find({}, {\"_id\": 0}).to_list(1000)
    trips = await db.trips.find({}, {\"_id\": 0}).to_list(2000)
    maintenance = await db.maintenance.find({\"status\": {\"$ne\": \"Completed\"}}, {\"_id\": 0}).to_list(500)

    today = datetime.now(timezone.utc).date().isoformat()

    def count_status(items, key, val):
        return sum(1 for i in items if i.get(key) == val)

    todays_trips = [t for t in trips if (t.get(\"scheduled_start\") or \"\").startswith(today) or (t.get(\"created_at\") or \"\").startswith(today)]
    revenue_today = sum(t.get(\"revenue\", 0) for t in todays_trips)
    monthly_revenue = sum(t.get(\"revenue\", 0) for t in trips)
    passengers_today = sum(t.get(\"passenger_count\", 0) for t in todays_trips)
    avg_delay = 0
    completed = [t for t in trips if t.get(\"status\") == \"Completed\"]
    if completed:
        avg_delay = sum(t.get(\"delay_min\", 0) for t in completed) / len(completed)

    # insurance & license expiring within 30 days
    thirty_days = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    insurance_expiring = sum(1 for v in vehicles if v.get(\"insurance_expiry\") and v[\"insurance_expiry\"] < thirty_days)
    license_expiring = sum(1 for d in drivers if d.get(\"license_expiry\") and d[\"license_expiry\"] < thirty_days)

    return {
        \"total_vehicles\": len(vehicles),
        \"active_vehicles\": count_status(vehicles, \"status\", \"Running\") + count_status(vehicles, \"status\", \"Available\"),
        \"inactive_vehicles\": count_status(vehicles, \"status\", \"Inactive\"),
        \"vehicles_on_route\": count_status(vehicles, \"status\", \"Running\"),
        \"vehicles_maintenance\": count_status(vehicles, \"status\", \"Maintenance\"),
        \"total_drivers\": len(drivers),
        \"drivers_available\": count_status(drivers, \"status\", \"Available\"),
        \"drivers_working\": count_status(drivers, \"status\", \"Driving\"),
        \"drivers_on_leave\": count_status(drivers, \"status\", \"Leave\"),
        \"todays_trips\": len(todays_trips),
        \"completed_trips\": count_status(trips, \"status\", \"Completed\"),
        \"cancelled_trips\": count_status(trips, \"status\", \"Cancelled\"),
        \"running_trips\": count_status(trips, \"status\", \"Running\"),
        \"revenue_today\": round(revenue_today, 2),
        \"monthly_revenue\": round(monthly_revenue, 2),
        \"fuel_consumption\": round(sum(v.get(\"current_fuel\", 0) for v in vehicles) / max(len(vehicles), 1), 1),
        \"avg_delay_min\": round(avg_delay, 1),
        \"passengers_today\": passengers_today,
        \"pending_maintenance\": len(maintenance),
        \"insurance_expiring\": insurance_expiring,
        \"license_expiring\": license_expiring,
        \"fleet_health_score\": max(0, 100 - len(maintenance) * 2 - insurance_expiring - license_expiring),
    }


@router.get(\"/analytics/overview\")
async def analytics_overview(user=Depends(get_current_user)):
    trips = await db.trips.find({}, {\"_id\": 0}).to_list(2000)
    fuel = await db.fuel_logs.find({}, {\"_id\": 0}).to_list(2000)
    drivers = await db.drivers.find({}, {\"_id\": 0}).to_list(500)

    # Revenue last 7 days
    today = datetime.now(timezone.utc).date()
    revenue_7d = []
    trips_7d = []
    for i in range(6, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        day_trips = [t for t in trips if (t.get(\"created_at\") or \"\").startswith(d)]
        revenue_7d.append({\"date\": d[5:], \"revenue\": round(sum(t.get(\"revenue\", 0) for t in day_trips), 2)})
        trips_7d.append({\"date\": d[5:], \"trips\": len(day_trips), \"passengers\": sum(t.get(\"passenger_count\", 0) for t in day_trips)})

    # Fuel consumption per day
    fuel_7d = []
    for i in range(6, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        day_fuel = [f for f in fuel if (f.get(\"date\") or \"\").startswith(d)]
        fuel_7d.append({\"date\": d[5:], \"liters\": round(sum(f.get(\"liters\", 0) for f in day_fuel), 1), \"cost\": round(sum(f.get(\"cost\", 0) for f in day_fuel), 2)})

    # Top drivers by score
    top_drivers = sorted(drivers, key=lambda d: d.get(\"driving_score\", 0), reverse=True)[:5]
    top_drivers = [{\"name\": d[\"name\"], \"score\": d.get(\"driving_score\", 0)} for d in top_drivers]

    # Trip status pie
    status_counts = {}
    for t in trips:
        s = t.get(\"status\", \"Unknown\")
        status_counts[s] = status_counts.get(s, 0) + 1
    status_dist = [{\"name\": k, \"value\": v} for k, v in status_counts.items()]

    return {
        \"revenue_7d\": revenue_7d,
        \"trips_7d\": trips_7d,
        \"fuel_7d\": fuel_7d,
        \"top_drivers\": top_drivers,
        \"status_dist\": status_dist,
    }


# -------- NOTIFICATIONS --------
@router.get(\"/notifications\")
async def list_notifications(user=Depends(get_current_user)):
    q = {\"$or\": [{\"user_id\": user[\"id\"]}, {\"user_id\": None}]}
    return await db.notifications.find(q, {\"_id\": 0}).sort(\"created_at\", -1).limit(50).to_list(50)


@router.post(\"/notifications/{nid}/read\")
async def mark_read(nid: str, user=Depends(get_current_user)):
    await db.notifications.update_one({\"id\": nid}, {\"$set\": {\"read\": True}})
    return {\"ok\": True}


@router.post(\"/notifications/read-all\")
async def read_all(user=Depends(get_current_user)):
    await db.notifications.update_many({\"$or\": [{\"user_id\": user[\"id\"]}, {\"user_id\": None}]}, {\"$set\": {\"read\": True}})
    return {\"ok\": True}


# -------- LIVE TRACKING (simulated) --------
@router.get(\"/tracking/live\")
async def live_tracking(user=Depends(get_current_user)):
    \"\"\"Return live vehicle positions - simulated GPS.\"\"\"
    running_trips = await db.trips.find({\"status\": \"Running\"}, {\"_id\": 0}).to_list(100)
    result = []
    for trip in running_trips:
        vehicle = await db.vehicles.find_one({\"id\": trip[\"vehicle_id\"]}, {\"_id\": 0})
        driver = await db.drivers.find_one({\"id\": trip[\"driver_id\"]}, {\"_id\": 0})
        route = await db.routes.find_one({\"id\": trip[\"route_id\"]}, {\"_id\": 0})
        if not (vehicle and route):
            continue
        # Interpolate along route
        progress = min(trip.get(\"progress\", 0) + random.uniform(0.5, 2.5), 100)
        start = route[\"start_coords\"]
        end = route[\"end_coords\"]
        p = progress / 100
        lat = start[\"lat\"] + (end[\"lat\"] - start[\"lat\"]) * p + random.uniform(-0.002, 0.002)
        lng = start[\"lng\"] + (end[\"lng\"] - start[\"lng\"]) * p + random.uniform(-0.002, 0.002)
        speed = round(random.uniform(35, 65), 1)
        await db.trips.update_one({\"id\": trip[\"id\"]}, {\"$set\": {
            \"progress\": progress, \"current_speed\": speed, \"current_location\": {\"lat\": lat, \"lng\": lng}
        }})
        result.append({
            \"trip_id\": trip[\"id\"],
            \"trip_code\": trip[\"trip_code\"],
            \"vehicle\": {\"id\": vehicle[\"id\"], \"number\": vehicle[\"vehicle_number\"], \"type\": vehicle[\"vehicle_type\"]},
            \"driver\": {\"id\": driver[\"id\"] if driver else None, \"name\": driver[\"name\"] if driver else \"-\"},
            \"route\": {\"name\": route[\"name\"], \"start\": route[\"start_point\"], \"end\": route[\"destination\"]},
            \"position\": {\"lat\": lat, \"lng\": lng},
            \"start_coords\": start,
            \"end_coords\": end,
            \"stops\": route.get(\"stops\", []),
            \"progress\": round(progress, 1),
            \"speed\": speed,
            \"eta_min\": max(0, int((100 - progress) / 100 * route.get(\"travel_time_min\", 60))),
        })
    return result


# -------- AI CHAT --------
@router.post(\"/ai/chat\")
async def ai_chat(data: ChatInput, user=Depends(get_current_user)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

    session_id = data.session_id or gen_id()

    # Context from database
    stats_docs = {
        \"vehicles\": await db.vehicles.count_documents({}),
        \"drivers\": await db.drivers.count_documents({}),
        \"trips_running\": await db.trips.count_documents({\"status\": \"Running\"}),
        \"trips_total\": await db.trips.count_documents({}),
        \"pending_maintenance\": await db.maintenance.count_documents({\"status\": {\"$ne\": \"Completed\"}}),
    }
    context = (
        f\"Current fleet status: {stats_docs['vehicles']} vehicles, {stats_docs['drivers']} drivers, \"
        f\"{stats_docs['trips_running']} running trips, {stats_docs['trips_total']} total trips, \"
        f\"{stats_docs['pending_maintenance']} pending maintenance items.\"
    )

    system_message = (
        \"You are TransitOps AI, an intelligent transport operations assistant. \"
        \"You help fleet managers with vehicle info, trip summaries, dashboard help, \"
        \"delay predictions, and analytics explanations. Be concise, professional, \"
        \"and use bullet points when useful. \"
        f\"CONTEXT: {context}\"
    )

    api_key = os.environ.get(\"EMERGENT_LLM_KEY\")
    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=system_message,
    ).with_model(\"openai\", \"gpt-5.2\")

    # Persist user message
    await db.chat_history.insert_one({
        \"id\": gen_id(), \"session_id\": session_id, \"user_id\": user[\"id\"],
        \"role\": \"user\", \"content\": data.message, \"created_at\": now_iso()
    })

    async def event_generator():
        full_response = \"\"
        try:
            async for event in chat.stream_message(UserMessage(text=data.message)):
                if isinstance(event, TextDelta):
                    full_response += event.content
                    yield f\"data: {event.content}

\"
                elif isinstance(event, StreamDone):
                    break
        except Exception as e:
            yield f\"data: [error: {str(e)}]

\"
        # Persist assistant response
        await db.chat_history.insert_one({
            \"id\": gen_id(), \"session_id\": session_id, \"user_id\": user[\"id\"],
            \"role\": \"assistant\", \"content\": full_response, \"created_at\": now_iso()
        })
        yield f\"data: [DONE:{session_id}]

\"

    return StreamingResponse(
        event_generator(),
        media_type=\"text/event-stream\",
        headers={\"Cache-Control\": \"no-cache\", \"X-Accel-Buffering\": \"no\"},
    )


@router.get(\"/ai/chat/history/{session_id}\")
async def chat_history(session_id: str, user=Depends(get_current_user)):
    msgs = await db.chat_history.find({\"session_id\": session_id, \"user_id\": user[\"id\"]}, {\"_id\": 0}).sort(\"created_at\", 1).to_list(500)
    return msgs


@router.get(\"/ai/insights\")
async def ai_insights(user=Depends(get_current_user)):
    \"\"\"AI-generated fleet insights (rule-based mock predictions).\"\"\"
    vehicles = await db.vehicles.find({}, {\"_id\": 0}).to_list(500)
    trips = await db.trips.find({}, {\"_id\": 0}).to_list(500)
    fuel = await db.fuel_logs.find({}, {\"_id\": 0}).to_list(500)

    insights = []
    low_fuel = [v for v in vehicles if v.get(\"current_fuel\", 100) < 25]
    if low_fuel:
        insights.append({
            \"type\": \"warning\", \"title\": \"Low Fuel Alert\",
            \"message\": f\"{len(low_fuel)} vehicles have less than 25% fuel. Refuel recommended.\",
        })
    delayed = [t for t in trips if t.get(\"delay_min\", 0) > 15]
    if delayed:
        insights.append({
            \"type\": \"warning\", \"title\": \"Delay Prediction\",
            \"message\": f\"{len(delayed)} active trips predicted to be delayed >15 min due to traffic.\",
        })
    avg_fuel_cost = sum(f.get(\"cost\", 0) for f in fuel[-30:]) / max(len(fuel[-30:]), 1)
    insights.append({
        \"type\": \"info\", \"title\": \"Fuel Cost Forecast\",
        \"message\": f\"Predicted next-week fuel cost: ${round(avg_fuel_cost * 7, 2)} based on trend.\",
    })
    insights.append({
        \"type\": \"success\", \"title\": \"Route Optimization\",
        \"message\": \"AI suggests rerouting 3 trips to save ~18 km & 22 minutes total.\",
    })
    return insights
