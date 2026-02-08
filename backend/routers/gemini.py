"""API routes for Gemini AI operations."""

from fastapi import APIRouter
from schemas import (
    AnalyzeImageRequest,
    FindManualRequest,
    GenerateStepImageRequest,
    TroubleshootRequest,
    ModerateImageRequest,
    ModerationResponse
)
import gemini_service

router = APIRouter(prefix="/gemini", tags=["gemini"])


@router.post("/analyze")
async def analyze_image(request: AnalyzeImageRequest):
    """Analyze an image and return repair analysis."""
    result = await gemini_service.analyze_image(
        request.photoBase64,
        request.userText or ""
    )
    return result


@router.post("/manual")
async def find_manual(request: FindManualRequest):
    """Search for official manual URL."""
    url = await gemini_service.find_manual(request.objectName)
    return {"url": url}


@router.post("/generate-step-image")
async def generate_step_image(request: GenerateStepImageRequest):
    """Generate a technical illustration for a repair step."""
    image_url = await gemini_service.generate_step_image(
        request.objectName,
        request.stepDescription,
        request.idealView
    )
    return {"imageUrl": image_url}


@router.post("/troubleshoot")
async def troubleshoot(request: TroubleshootRequest):
    """Get troubleshooting advice for current repair step."""
    advice = await gemini_service.troubleshoot(
        request.photoBase64,
        request.objectName,
        request.stepIndex,
        request.currentStepText
    )
    return {"advice": advice}


@router.post("/moderate", response_model=ModerationResponse)
async def moderate_image(request: ModerateImageRequest):
    """Moderate an image for safety before public posting."""
    result = await gemini_service.moderate_image(request.photoBase64)
    return result
