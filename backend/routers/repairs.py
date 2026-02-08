"""API routes for repair CRUD operations."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Repair
from schemas import RepairCreate, RepairResponse

router = APIRouter(prefix="/repairs", tags=["repairs"])


def repair_to_response(repair: Repair) -> dict:
    """Convert SQLAlchemy model to response dict with camelCase keys."""
    return {
        "repairId": repair.repair_id,
        "timestamp": repair.timestamp,
        "isPublic": repair.is_public,
        "isSuccessful": repair.is_successful,
        "status": repair.status,
        "objectName": repair.object_name,
        "category": repair.category,
        "issueType": repair.issue_type,
        "safetyWarning": repair.safety_warning,
        "toolsNeeded": repair.tools_needed,
        "idealViewInstruction": repair.ideal_view_instruction,
        "userPhotoUrl": repair.user_photo_url,
        "idealViewImageUrl": repair.ideal_view_image_url,
        "manualUrl": repair.manual_url,
        "steps": repair.steps or []
    }


@router.post("/", response_model=RepairResponse)
def create_repair(repair: RepairCreate, db: Session = Depends(get_db)):
    """Create a new repair document."""
    db_repair = Repair(
        repair_id=repair.repairId,
        timestamp=repair.timestamp,
        is_public=repair.isPublic,
        is_successful=repair.isSuccessful,
        status=repair.status,
        object_name=repair.objectName,
        category=repair.category,
        issue_type=repair.issueType,
        safety_warning=repair.safetyWarning,
        tools_needed=repair.toolsNeeded,
        ideal_view_instruction=repair.idealViewInstruction,
        user_photo_url=repair.userPhotoUrl,
        ideal_view_image_url=repair.idealViewImageUrl,
        manual_url=repair.manualUrl,
        steps=[step.model_dump() for step in repair.steps]
    )
    
    db.add(db_repair)
    db.commit()
    db.refresh(db_repair)
    
    return repair_to_response(db_repair)


@router.get("/")
def get_all_repairs(
    public_only: bool = False,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all repairs with optional filters."""
    query = db.query(Repair)
    
    if public_only:
        query = query.filter(Repair.is_public == True)
    
    if category and category != "all":
        query = query.filter(Repair.category == category)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Repair.object_name.ilike(search_term)) |
            (Repair.issue_type.ilike(search_term))
        )
    
    repairs = query.order_by(Repair.timestamp.desc()).all()
    return [repair_to_response(r) for r in repairs]


@router.get("/public")
def get_public_repairs(db: Session = Depends(get_db)):
    """Get all public repairs for the community feed."""
    repairs = db.query(Repair)\
        .filter(Repair.is_public == True)\
        .order_by(Repair.timestamp.desc())\
        .all()
    return [repair_to_response(r) for r in repairs]


@router.get("/{repair_id}")
def get_repair(repair_id: str, db: Session = Depends(get_db)):
    """Get a specific repair by ID."""
    repair = db.query(Repair).filter(Repair.repair_id == repair_id).first()
    if not repair:
        raise HTTPException(status_code=404, detail="Repair not found")
    return repair_to_response(repair)


@router.delete("/{repair_id}")
def delete_repair(repair_id: str, db: Session = Depends(get_db)):
    """Delete a repair by ID."""
    repair = db.query(Repair).filter(Repair.repair_id == repair_id).first()
    if not repair:
        raise HTTPException(status_code=404, detail="Repair not found")
    
    db.delete(repair)
    db.commit()
    return {"message": "Repair deleted"}
