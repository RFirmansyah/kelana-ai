from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.sql import func
from database import Base

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String, nullable=False)
    budget = Column(Float, nullable=False)
    daily_budget = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    travel_style = Column(String, nullable=False)       
    ai_recommendation = Column(String, nullable=True)          
    recommended_transportation = Column(String, nullable=False)
