from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation,
    get_trip_categories,
    get_transportations,
    get_recommendations
)
from services.bedrock_service import (
    get_bedrock_client,
    get_ai_recommendation
)
from models.trip import Trip
from database import SessionLocal, init_db

load_dotenv()

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/")
def home():
    return{
        "message": "Welcome to KelanaAI"
    }

@app.get("/api/v1/trip-categories")
def home():
    trip_categories = get_trip_categories()

    return{
        "trip_categories" : trip_categories
    }    

@app.get("/api/v1/recommendations")
def home():
    dest_recommendations = get_recommendations()

    return{
        "dest_recommendations" : dest_recommendations
    }    

@app.get("/api/v1/transportations")
def home():
    transportations_mod = get_transportations()

    return{
        "transportations_mod" : transportations_mod
    }            

@app.post("/api/v1/trips")    
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    recommended_transportation = get_transportation(request.budget)

    ai_recommendation = get_ai_recommendation(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        travel_style=request.travel_style
    )

    trip = Trip(
        destination = request.destination,
        budget = request.budget,
        daily_budget = daily_budget,
        category = category,
        travel_style = request.travel_style,
        recommended_transportation = recommended_transportation,
        ai_recommendation = ai_recommendation,
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()

    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found.")

    return trip

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail="Trip not found")

    db.delete(trip)
    db.commit()
    db.close()

    return {"message": f"Trip {trip_id} deleted successfully"}

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripRequest):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail="Trip not found")

    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    recommended_transportation = get_transportation(request.budget)

    trip.destination = request.destination
    trip.budget = request.budget
    trip.daily_budget = daily_budget
    trip.category = category
    trip.travel_style = request.travel_style
    trip.recommended_transportation = recommended_transportation

    db.commit()
    db.refresh(trip)
    db.close()

    return trip        