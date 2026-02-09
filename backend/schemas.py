from pydantic import BaseModel
from typing import Optional
from enum import Enum


class RepairStatus(str, Enum):
    OK = "ok"
    UNSAFE = "unsafe"
    UNCLEAR = "unclear"


class RepairCategory(str, Enum):
    ELECTRONICS = "electronics"
    PLUMBING = "plumbing"
    APPLIANCE = "appliance"
    FURNITURE = "furniture"
    OTHER = "other"


class RepairStep(BaseModel):
    """A single repair step."""
    stepNumber: int
    instruction: str
    visualDescription: str
    generatedImageUrl: Optional[str] = None


class RepairAnalysis(BaseModel):
    """Analysis result from Gemini."""
    status: str
    objectName: str
    category: str
    issueType: str
    safetyWarning: Optional[str] = None
    toolsNeeded: bool
    idealViewInstruction: str
    steps: list[RepairStep]


class RepairCreate(BaseModel):
    """Request body for creating a repair document."""
    repairId: str
    timestamp: float
    isPublic: bool
    isSuccessful: Optional[bool] = None
    userPhotoUrl: str
    idealViewImageUrl: Optional[str] = None
    manualUrl: Optional[str] = None
    # Analysis fields
    status: str
    objectName: str
    category: str
    issueType: str
    safetyWarning: Optional[str] = None
    toolsNeeded: bool
    idealViewInstruction: str
    steps: list[RepairStep]


class RepairResponse(RepairCreate):
    """Response model for repair documents."""
    pass


class AnalyzeImageRequest(BaseModel):
    """Request for image analysis."""
    photoBase64: str
    userText: Optional[str] = ""


class FindManualRequest(BaseModel):
    """Request for manual search."""
    objectName: str


class GenerateStepImageRequest(BaseModel):
    """Request for step image generation."""
    objectName: str
    stepDescription: str
    idealView: str
    referenceImageBase64: Optional[str] = None
    shouldHighlight: Optional[bool] = False


class TroubleshootRequest(BaseModel):
    """Request for troubleshooting."""
    photoBase64: str
    objectName: str
    stepIndex: int
    currentStepText: str


class ModerateImageRequest(BaseModel):
    """Request for image moderation."""
    photoBase64: str


class ModerationResponse(BaseModel):
    """Response from image moderation."""
    safe: bool
    reason: Optional[str] = None
