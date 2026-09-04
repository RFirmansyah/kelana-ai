from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import joinedload

# --- Import ALL models first so SQLAlchemy resolves all relationships ---
from models.user import User          # noqa: F401
from models.trip import Trip          # noqa: F401
from models.conversation import Conversation, Message  # noqa: F401

from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation,
    get_trip_categories,
    get_transportations,
    get_recommendations,
)
from services.bedrock_service import (
    get_bedrock_client,
    get_ai_recommendation,
    chat_direct,
    chat_with_context,
)
from services.auth_service import register_user, login_user, get_current_user, change_password
from services.kb_service import retrieve_and_generate
from database import SessionLocal, init_db

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

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

class QuestionRequest(BaseModel):
    question: str

class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    role: str
    content: str
    created_at: Optional[datetime] = None

class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    messages: List[MessageOut] = []

class SendMessageRequest(BaseModel):
    content: str
    mode: str = "rag"  # "rag" | "llm"

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# ---------------------------------------------------------------------------
# Health / root
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "OK"}

@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI"}

# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------

@app.post("/api/v1/auth/register", status_code=201)
def register(request: RegisterRequest):
    db = SessionLocal()
    try:
        user = register_user(db=db, name=request.name, email=request.email, password=request.password)
        return {"id": user.id, "name": user.name, "email": user.email, "created_at": user.created_at}
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
        user = db.query(User).filter(User.id == current_user.id).first()
        change_password(db=db, user=user, current_password=request.current_password, new_password=request.new_password)
        return {"message": "Password updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

# ---------------------------------------------------------------------------
# Trip metadata routes
# ---------------------------------------------------------------------------

@app.get("/api/v1/trip-categories")
def trip_categories():
    return {"trip_categories": get_trip_categories()}

@app.get("/api/v1/recommendations")
def recommendations():
    return {"dest_recommendations": get_recommendations()}

@app.get("/api/v1/transportations")
def transportations():
    return {"transportations_mod": get_transportations()}

# ---------------------------------------------------------------------------
# Trip routes
# ---------------------------------------------------------------------------

@app.post("/api/v1/trips", response_model=TripOut)
def create_trip(request: TripRequest, current_user: User = Depends(get_current_user)):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    recommended_transportation = get_transportation(request.budget)
    ai_recommendation = get_ai_recommendation(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        travel_style=request.travel_style,
    )
    trip = Trip(
        user_id=current_user.id,
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        daily_budget=daily_budget,
        category=category,
        travel_style=request.travel_style,
        recommended_transportation=recommended_transportation,
        ai_recommendation=ai_recommendation,
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
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.deleted_at.is_(None)).first()
    finally:
        db.close()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found.")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this trip.")
    return trip

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.deleted_at.is_(None)).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="You do not have access to this trip.")
    trip.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.close()
    return {"message": f"Trip {trip_id} deleted successfully"}

@app.put("/api/v1/trips/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, request: TripRequest, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.deleted_at.is_(None)).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="You do not have access to this trip.")
    trip.destination = request.destination
    trip.days = request.days
    trip.budget = request.budget
    trip.daily_budget = calculate_daily_budget(request.budget, request.days)
    trip.category = get_trip_category(request.budget)
    trip.travel_style = request.travel_style
    trip.recommended_transportation = get_transportation(request.budget)
    db.commit()
    db.refresh(trip)
    db.close()
    return trip

# ---------------------------------------------------------------------------
# Legacy single-shot RAG endpoint
# ---------------------------------------------------------------------------

@app.post("/api/v1/ask")
def ask_endpoint(request: QuestionRequest, current_user: User = Depends(get_current_user)):
    answer = retrieve_and_generate(request.question)
    return {"question": request.question, "answer": answer}

# ---------------------------------------------------------------------------
# Conversation routes
# ---------------------------------------------------------------------------

def _load_conversation(db, conversation_id: int, user_id: int) -> Conversation:
    """Fetch a conversation with messages eagerly loaded. Returns None if not found."""
    return (
        db.query(Conversation)
        .options(joinedload(Conversation.messages))
        .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
        .first()
    )


@app.post("/api/v1/conversations", response_model=ConversationOut, status_code=201)
def create_conversation(current_user: User = Depends(get_current_user)):
    """Start a new conversation for the authenticated user."""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        conv = Conversation(user_id=current_user.id, created_at=now, updated_at=now)
        db.add(conv)
        db.commit()
        # Re-query with joinedload so messages list is populated before session closes
        conv = _load_conversation(db, conv.id, current_user.id)
        return conv
    finally:
        db.close()


@app.post("/api/v1/conversations/{conversation_id}/messages", response_model=MessageOut)
def send_message(
    conversation_id: int,
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Append a user message and return the AI reply.
    mode='rag' — retrieve from Bedrock Knowledge Base, then synthesise.
    mode='llm' — send directly to the LLM (no KB retrieval).
    """
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
        if conv is None:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Persist user message
        user_msg = Message(
            conversation_id=conv.id,
            role="user",
            content=request.content,
            created_at=datetime.now(timezone.utc),
        )
        db.add(user_msg)
        db.commit()

        # Build history (last 20 messages, excluding the one just added)
        history_rows = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc(), Message.id.desc())
            .limit(20)
            .all()
        )
        history_rows.reverse()
        history_dicts = [{"role": m.role, "content": m.content} for m in history_rows[:-1]]

        # Generate AI reply
        if request.mode == "rag":
            kb_result = retrieve_and_generate(request.content)
            answer = chat_with_context(
                question=request.content,
                context=kb_result.get("answer", ""),
                sources=kb_result.get("source", []),
                history=history_dicts,
            )
        else:
            answer = chat_direct(message=request.content, history=history_dicts)

        # Persist and return assistant message
        assistant_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=answer,
            created_at=datetime.now(timezone.utc),
        )
        db.add(assistant_msg)

        # Keep history ordered by recent activity and generate a useful title
        # from the first user message.
        now = datetime.now(timezone.utc)
        conv.updated_at = now
        if not conv.title:
            title = request.content.strip().replace("\n", " ")
            conv.title = title[:117] + "..." if len(title) > 120 else title

        db.commit()
        db.refresh(assistant_msg)
        return assistant_msg
    finally:
        db.close()


@app.get("/api/v1/conversations", response_model=List[ConversationOut])
def list_conversations(current_user: User = Depends(get_current_user)):
    """Return all conversations for the authenticated user, with messages."""
    db = SessionLocal()
    try:
        return (
            db.query(Conversation)
            .options(joinedload(Conversation.messages))
            .filter(Conversation.user_id == current_user.id)
            .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
            .all()
        )
    finally:
        db.close()


@app.get("/api/v1/conversations/{conversation_id}", response_model=ConversationOut)
def get_conversation(conversation_id: int, current_user: User = Depends(get_current_user)):
    """Return a single conversation with all its messages."""
    db = SessionLocal()
    try:
        conv = _load_conversation(db, conversation_id, current_user.id)
        if conv is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conv
    finally:
        db.close()


@app.delete("/api/v1/conversations/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: int, current_user: User = Depends(get_current_user)):
    """Delete one conversation owned by the authenticated user."""
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
        if conv is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
        db.delete(conv)
        db.commit()
    finally:
        db.close()
