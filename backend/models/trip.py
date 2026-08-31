from sqlalchemy import Column, BigInteger, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id            = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    destination = Column(String, nullable=False)
    days = Column(Integer, nullable=True)
    budget = Column(Float, nullable=False)
    daily_budget = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    travel_style = Column(String, nullable=False)       
    ai_recommendation = Column(String, nullable=True)          
    recommended_transportation = Column(String, nullable=False)
    created_at         = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    deleted_at         = Column(DateTime(timezone=True), nullable=True, index=True)

    user = relationship("User", back_populates="trips")