from fastapi import FastAPI
from pydantic import BaseModel
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation,
    get_trip_categories,
    get_transportations,
    get_recommendations
)

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

app = FastAPI()

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

    return {
        "destination" : request.destination,
        "budget" : request.budget,
        "daily_budget" : daily_budget,
        "category" : category,
        "travel_style" : request.travel_style,
        "recommended_transportation" : recommended_transportation,
    }