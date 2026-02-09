"""Gemini AI service for repair analysis and image generation."""

import base64
import json
import re
from google import genai
from google.genai import types
from config import get_settings
from schemas import ModerationResponse

settings = get_settings()

# Model configuration - centralized
MODEL_TEXT = "gemini-3-flash-preview"           # Analysis, troubleshooting, moderation
MODEL_TEXT_FALLBACK = "gemini-2.5-flash"      # Backup if primary unavailable
MODEL_IMAGE = "gemini-2.5-flash-image"          # Image generation (uses imagen internally)
MODEL_SEARCH = "gemini-3-flash-preview"         # Manual search with Google grounding

# Initialize clients
_text_client = None
_image_client = None
_search_client = None


def get_text_client() -> genai.Client:
    """Get the Gemini client for text operations (free tier)."""
    global _text_client
    if _text_client is None:
        _text_client = genai.Client(api_key=settings.gemini_api_key)
    return _text_client


def get_image_client() -> genai.Client:
    """Get the Gemini client for image generation (billed)."""
    global _image_client
    if _image_client is None:
        _image_client = genai.Client(api_key=settings.gemini_image_api_key)
    return _image_client


def get_search_client() -> genai.Client:
    """Get the Gemini client for search operations with grounding."""
    global _search_client
    if _search_client is None:
        _search_client = genai.Client(api_key=settings.gemini_search_api_key)
    return _search_client


async def analyze_image(photo_base64: str, user_text: str = "") -> dict:
    """Analyze image and generate repair blueprint."""
    client = get_text_client()
    
    prompt = f"""You are a repair diagnostic AI. Analyze this image and return valid JSON following the provided schema.
    {f'User context: "{user_text}"' if user_text else ""}

    TASKS:
    1. Identify the object (brand/model if visible)
    2. Identify the defect or issue
    3. Check if repair is safe for non-experts
    4. Determine if external tools are required
    5. Plan 3-5 repair steps

    SAFETY RULES:
    - If electrical with exposed wiring -> status: "unsafe"
    - If gas appliance -> status: "unsafe"
    - If spring-loaded/high tension -> add warning

    STEP 1 RULES:
    - If toolsNeeded=true: Step 1 = "Gather tools: [list]"
    - If toolsNeeded=false: Step 1 = immediate action
    Limit steps to 3-5. Be specific."""

    # Decode base64 image
    image_data = base64.b64decode(photo_base64)
    
    response = client.models.generate_content(
        model=MODEL_TEXT,
        contents=[
            types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema={
                "type": "object",
                "properties": {
                    "status": {"type": "string"},
                    "objectName": {"type": "string"},
                    "category": {"type": "string"},
                    "issueType": {"type": "string"},
                    "safetyWarning": {"type": "string"},
                    "toolsNeeded": {"type": "boolean"},
                    "idealViewInstruction": {"type": "string"},
                    "steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "stepNumber": {"type": "integer"},
                                "instruction": {"type": "string"},
                                "visualDescription": {"type": "string"}
                            }
                        }
                    }
                }
            }
        )
    )
    
    return json.loads(response.text)


def _extract_urls_from_response(response) -> list[str]:
    urls: list[str] = []

    if response.candidates and response.candidates[0].grounding_metadata:
        chunks = response.candidates[0].grounding_metadata.grounding_chunks
        if chunks:
            for chunk in chunks:
                if chunk.web and chunk.web.uri:
                    urls.append(chunk.web.uri)

    text = response.text or ""
    if text:
        urls.extend(re.findall(r'https?://[^\s)]+', text))

    seen = set()
    unique_urls = []
    for url in urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)

    return unique_urls


def _pick_preferred_url(urls: list[str], prefer_pdf: bool) -> str | None:
    if not urls:
        return None
    if prefer_pdf:
        for url in urls:
            if ".pdf" in url.lower():
                return url
    return urls[0]


async def find_manual(object_name: str) -> str | None:
    """Find a single best resource link with PDF priority, then broader sources."""
    try:
        client = get_search_client()

        search_prompts = [
            (
                f"Find an official PDF repair manual for: {object_name}. Return the best URL.",
                True,
            ),
            (
                f"Find the official support page for: {object_name}. Return the best URL.",
                False,
            ),
            (
                f"Find a reputable repair guide article for: {object_name}. Return the best URL.",
                False,
            ),
            (
                f"Find a helpful YouTube repair video for: {object_name}. Return the best URL.",
                False,
            ),
            (
                f"Find a helpful Reddit thread about repairing: {object_name}. Return the best URL.",
                False,
            ),
        ]

        for prompt, prefer_pdf in search_prompts:
            response = client.models.generate_content(
                model=MODEL_SEARCH,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                )
            )

            urls = _extract_urls_from_response(response)
            preferred = _pick_preferred_url(urls, prefer_pdf)
            if preferred:
                return preferred

        return None
    except Exception as e:
        print(f"Manual search failed: {e}")
        return None


async def generate_step_image(object_name: str, step_description: str, ideal_view: str) -> str | None:
    """Generate technical illustration for a repair step using billed key."""
    try:
        client = get_image_client()
        
        prompt = f"Professional technical repair manual photograph. Object: {object_name}. Scene: {ideal_view}. Action: {step_description}. High-quality studio lighting, sharp focus on repair area, neutral background, no text overlays, realistic photographic style."
        
        response = client.models.generate_content(
            model=MODEL_IMAGE,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["image", "text"],
                image_generation_config=types.ImageGenerationConfig(
                    aspect_ratio="1:1"
                )
            )
        )
        
        # Find generated image in response
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    mime_type = part.inline_data.mime_type or "image/png"
                    # The SDK already returns the data as a base64 string in bytes
                    b64_data = part.inline_data.data.decode() if isinstance(part.inline_data.data, bytes) else part.inline_data.data
                    return f"data:{mime_type};base64,{b64_data}"
        
        return None
        
    except Exception as e:
        print(f"Step image generation failed: {e}")
        return None


async def troubleshoot(photo_base64: str, object_name: str, step_index: int, current_step_text: str) -> str:
    """Provide troubleshooting advice based on user's progress photo."""
    try:
        client = get_text_client()
        
        prompt = f'The user is repairing a {object_name} and is currently at Step {step_index + 1}: "{current_step_text}". They have provided a photo of their current state because they are "stuck". Analyze the photo, identify common pitfalls at this stage, and provide encouraging, expert troubleshooting advice. Keep it under 100 words.'
        
        image_data = base64.b64decode(photo_base64)
        
        response = client.models.generate_content(
            model=MODEL_TEXT,
            contents=[
                types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
                prompt
            ]
        )
        
        return response.text or "Check all connections and try the step again carefully."
        
    except Exception as e:
        print(f"Troubleshooting failed: {e}")
        return "I'm having trouble analyzing the live feed. Please double-check your tools and the instruction text."


async def moderate_image(photo_base64: str) -> ModerationResponse:
    """Moderate user-uploaded photos for safety."""
    try:
        client = get_text_client()
        
        prompt = 'Analyze this image for safety. REJECT if: nudity, violence, gore, hate symbols. Return JSON: { "safe": boolean, "reason": string | null }'
        
        image_data = base64.b64decode(photo_base64)
        
        response = client.models.generate_content(
            model=MODEL_TEXT,
            contents=[
                types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "safe": {"type": "boolean"},
                        "reason": {"type": "string"}
                    }
                }
            )
        )
        
        result = json.loads(response.text or '{"safe": true, "reason": null}')
        return ModerationResponse(**result)
        
    except Exception:
        return ModerationResponse(safe=True, reason=None)
