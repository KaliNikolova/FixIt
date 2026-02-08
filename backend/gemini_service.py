"""Gemini AI service for repair analysis and image generation."""

from google import genai
from google.genai import types
from config import get_settings
from schemas import RepairAnalysis, ModerationResponse

settings = get_settings()

# Initialize clients
_text_client = None
_image_client = None


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


async def analyze_image(photo_base64: str, user_text: str = "") -> RepairAnalysis:
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

    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-04-17",
        contents=[
            types.Content(
                parts=[
                    types.Part.from_bytes(
                        data=bytes.fromhex(photo_base64) if all(c in '0123456789abcdefABCDEF' for c in photo_base64[:10]) else __import__('base64').b64decode(photo_base64),
                        mime_type="image/jpeg"
                    ),
                    types.Part.from_text(prompt)
                ]
            )
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
    
    import json
    return json.loads(response.text)


async def find_manual(object_name: str) -> str | None:
    """Search for official manuals using Google Search grounding."""
    try:
        client = get_text_client()
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-04-17",
            contents=f"Find the official support page or PDF repair manual for: {object_name}. Return the primary URL.",
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )
        
        # Try to extract URL from grounding metadata
        if response.candidates and response.candidates[0].grounding_metadata:
            chunks = response.candidates[0].grounding_metadata.grounding_chunks
            if chunks:
                for chunk in chunks:
                    if chunk.web and chunk.web.uri:
                        return chunk.web.uri
        
        # Fallback: extract URL from text
        import re
        text = response.text or ""
        url_match = re.search(r'https?://[^\s]+', text)
        return url_match.group(0) if url_match else None
        
    except Exception as e:
        print(f"Manual search failed: {e}")
        return None


async def generate_step_image(object_name: str, step_description: str, ideal_view: str) -> str | None:
    """Generate technical illustration for a repair step using billed key."""
    try:
        client = get_image_client()
        
        prompt = f"Professional technical repair manual photograph. Object: {object_name}. Scene: {ideal_view}. Action: {step_description}. High-quality studio lighting, sharp focus on repair area, neutral background, no text overlays, realistic photographic style."
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["image", "text"]
            )
        )
        
        # Find generated image in response
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    import base64
                    return f"data:image/png;base64,{base64.b64encode(part.inline_data.data).decode()}"
        
        return None
        
    except Exception as e:
        print(f"Step image generation failed: {e}")
        return None


async def troubleshoot(photo_base64: str, object_name: str, step_index: int, current_step_text: str) -> str:
    """Provide troubleshooting advice based on user's progress photo."""
    try:
        client = get_text_client()
        
        prompt = f'The user is repairing a {object_name} and is currently at Step {step_index + 1}: "{current_step_text}". They have provided a photo of their current state because they are "stuck". Analyze the photo, identify common pitfalls at this stage, and provide encouraging, expert troubleshooting advice. Keep it under 100 words.'
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-04-17",
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_bytes(
                            data=__import__('base64').b64decode(photo_base64),
                            mime_type="image/jpeg"
                        ),
                        types.Part.from_text(prompt)
                    ]
                )
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
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-04-17",
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_bytes(
                            data=__import__('base64').b64decode(photo_base64),
                            mime_type="image/jpeg"
                        ),
                        types.Part.from_text(prompt)
                    ]
                )
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
        
        import json
        result = json.loads(response.text or '{"safe": true, "reason": null}')
        return ModerationResponse(**result)
        
    except Exception:
        return ModerationResponse(safe=True, reason=None)
