from sqlalchemy import Column, String, Integer, Boolean, Text, Float, JSON
from database import Base


class Repair(Base):
    """SQLAlchemy model for repair documents."""
    
    __tablename__ = "repairs"
    
    repair_id = Column(String, primary_key=True, index=True)
    timestamp = Column(Float, nullable=False)
    is_public = Column(Boolean, default=False)
    is_successful = Column(Boolean, nullable=True)
    
    # Analysis fields
    status = Column(String, nullable=False)
    object_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    issue_type = Column(String, nullable=False)
    safety_warning = Column(Text, nullable=True)
    tools_needed = Column(Boolean, default=False)
    ideal_view_instruction = Column(Text, nullable=True)
    
    # Image URLs (base64 data)
    user_photo_url = Column(Text, nullable=False)
    ideal_view_image_url = Column(Text, nullable=True)
    manual_url = Column(Text, nullable=True)
    
    # Steps stored as JSON array
    steps = Column(JSON, nullable=False, default=list)
