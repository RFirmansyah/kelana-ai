from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime, timezone
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
from services.auth_service import register_user, login_user, get_current_user, change_password
from models.trip import Trip
from models.user import User
from database import SessionLocal, init_db
from services.kb_service import retrieve_and_generate # ask_knowledge_base

load_dotenv()

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)    

class RecentTrip(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    destination: str
    travel_style: str
    created_at: Optional[datetime] = None    

class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    destination: str
    days: Optional[int] = None
    budget: float
    daily_budget: float
    category: str
    travel_style: str
    recommended_transportation: str
    ai_recommendation: Optional[str] = None
    created_at: Optional[datetime] = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/health")
def health():
    return {"status": "OK"}

@app.get("/")
def home():
    return{
        "message": "Welcome to KelanaAI"
    }

@app.post("/api/v1/auth/register", status_code=201)
def register(request: RegisterRequest):
    db = SessionLocal()
    try:
        user = register_user(
            db       = db,
            name     = request.name,
            email    = request.email,
            password = request.password,
        )
        return {
            "id":         user.id,
            "name":       user.name,
            "email":      user.email,
            "created_at": user.created_at,
        }
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    finally:
        db.close()

@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    db = SessionLocal()
    try:
        return login_user(db=db, email=request.email, password=request.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    finally:
        db.close()


@app.get("/api/v1/auth/me")
def me(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        trip_count = (
            db.query(Trip)
            .filter(Trip.user_id == current_user.id, Trip.deleted_at.is_(None))
            .count()
        )
        recent_trips = (
            db.query(Trip)
            .filter(Trip.user_id == current_user.id, Trip.deleted_at.is_(None))
            .order_by(Trip.created_at.desc(), Trip.id.desc())
            .limit(3)
            .all()
        )
    finally:
        db.close()
    return {
        "id":           current_user.id,
        "name":         current_user.name,
        "email":        current_user.email,
        "created_at":   current_user.created_at,
        "total_trips":  trip_count,
        "recent_trips": [RecentTrip.model_validate(t) for t in recent_trips],
    } 

@app.put("/api/v1/auth/change-password")
def change_password_route(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        # current_user was loaded in a different session (inside get_current_user);
        # re-fetch it in this session so the update actually persists.
        user = db.query(User).filter(User.id == current_user.id).first()
        change_password(
            db=db,
            user=user,
            current_password=request.current_password,
            new_password=request.new_password,
        )
        return {"message": "Password updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()    

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

@app.post("/api/v1/trips", response_model=TripOut)
def create_trip(request: TripRequest, current_user: User = Depends(get_current_user)):
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
        user_id           = current_user.id,
        destination = request.destination,
        days              = request.days,
        budget = request.budget,
        daily_budget = daily_budget,
        category = category,
        travel_style = request.travel_style,
        recommended_transportation = recommended_transportation,
        ai_recommendation = ai_recommendation,
    )

    db = SessionLocal()
    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()

@app.get("/api/v1/trips", response_model=List[TripOut])
def list_trips(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return (
            db.query(Trip)
            .filter(Trip.user_id == current_user.id, Trip.deleted_at.is_(None))
            .all()
        )
    finally:
        db.close()

@app.get("/api/v1/trips/{trip_id}", response_model=TripOut)
def get_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = (
        db.query(Trip)
        .filter(Trip.id == trip_id, Trip.deleted_at.is_(None))
        .first()
    )
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found.")

    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this trip.")

    return trip

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = (
        db.query(Trip)
        .filter(Trip.id == trip_id, Trip.deleted_at.is_(None))
        .first()
    )

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="You do not have access to this trip.")

    # Soft delete: mark as deleted instead of removing the row, so the
    # data can still be recovered/audited later.
    trip.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.close()

    return {"message": f"Trip {trip_id} deleted successfully"}

@app.put("/api/v1/trips/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, request: TripRequest, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = (
        db.query(Trip)
        .filter(Trip.id == trip_id, Trip.deleted_at.is_(None))
        .first()
    )

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="You do not have access to this trip.")

    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    recommended_transportation = get_transportation(request.budget)

    trip.destination = request.destination
    trip.days = request.days
    trip.budget = request.budget
    trip.daily_budget = daily_budget
    trip.category = category
    trip.travel_style = request.travel_style
    trip.recommended_transportation = recommended_transportation

    db.commit()
    db.refresh(trip)
    db.close()

    return trip

class QuestionRequest(BaseModel):
    question: str    

@app.post("/api/v1/ask")
def ask_endpoint(request: QuestionRequest, current_user: User = Depends(get_current_user)):
  # 1. Send question to Knowledge Base
  answer = retrieve_and_generate(
    request.question
  )
  # 2. Return grounded answer to frontend
  return {
    "question": request.question,
    "answer": answer
  }