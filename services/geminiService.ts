
import { GoogleGenAI, Type } from "@google/genai";
import { RepairAnalysis, RepairStatus, RepairCategory } from "../types";

// Helper to initialize GoogleGenAI with appropriate configuration. Always use named parameter.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // Analyzes image and user description to generate a structured repair blueprint.
  async analyzeImage(photoBase64: string, userText: string = ""): Promise<RepairAnalysis> {
    const ai = getAI();
    const prompt = `You are a repair diagnostic AI. Analyze this image and return valid JSON following the provided schema.
    ${userText ? `User context: "${userText}"` : ""}

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
    Limit steps to 3-5. Be specific.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: photoBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            objectName: { type: Type.STRING },
            category: { type: Type.STRING },
            issueType: { type: Type.STRING },
            safetyWarning: { type: Type.STRING },
            toolsNeeded: { type: Type.BOOLEAN },
            idealViewInstruction: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  instruction: { type: Type.STRING },
                  visualDescription: { type: Type.STRING }
                },
                propertyOrdering: ["stepNumber", "instruction", "visualDescription"]
              }
            }
          },
          propertyOrdering: ["status", "objectName", "category", "issueType", "safetyWarning", "toolsNeeded", "idealViewInstruction", "steps"]
        }
      }
    });

    try {
      const cleanText = response.text.trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse Gemini response", e, response.text);
      throw new Error("Invalid response from AI analyzer.");
    }
  },

  // Searches for official manuals or support pages using Google Search grounding.
  async findManual(objectName: string): Promise<string | null> {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Find the official support page or PDF repair manual for: ${objectName}. Return the primary URL.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && chunks.length > 0) {
        const firstWeb = chunks.find(c => c.web?.uri)?.web?.uri;
        if (firstWeb) return firstWeb;
      }

      const text = response.text;
      const urlMatch = text?.match(/https?:\/\/[^\s]+/);
      return urlMatch ? urlMatch[0] : null;
    } catch (err) {
      console.warn("Manual search failed (likely credits/API issue)", err);
      return null;
    }
  },

  // Generates a technical illustration for a specific repair step.
  async generateStepImage(objectName: string, stepDescription: string, idealView: string): Promise<string | null> {
    try {
      const ai = getAI();
      const prompt = `Professional technical repair manual photograph. Object: ${objectName}. Scene: ${idealView}. Action: ${stepDescription}. High-quality studio lighting, sharp focus on repair area, neutral background, no text overlays, realistic photographic style.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      // Iterate through candidates and parts to find the generated image.
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (err) {
      console.warn("Step image generation failed (likely credits/API issue)", err);
    }
    return null;
  },

  // Provides real-time troubleshooting advice based on a photo of the user's progress.
  async troubleshoot(photoBase64: string, objectName: string, stepIndex: number, currentStepText: string): Promise<string> {
    try {
      const ai = getAI();
      const prompt = `The user is repairing a ${objectName} and is currently at Step ${stepIndex + 1}: "${currentStepText}". They have provided a photo of their current state because they are "stuck". Analyze the photo, identify common pitfalls at this stage, and provide encouraging, expert troubleshooting advice. Keep it under 100 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: photoBase64 } },
            { text: prompt }
          ]
        }
      });

      return response.text || "Check all connections and try the step again carefully.";
    } catch (err) {
      console.warn("Troubleshooting failed", err);
      return "I'm having trouble analyzing the live feed. Please double-check your tools and the instruction text.";
    }
  },

  // Moderates user-uploaded photos for safety before public posting.
  async moderateImage(photoBase64: string): Promise<{ safe: boolean; reason: string | null }> {
    try {
      const ai = getAI();
      const prompt = `Analyze this image for safety. REJECT if: nudity, violence, gore, hate symbols. Return JSON: { "safe": boolean, "reason": string | null }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: photoBase64 } },
            { text: prompt }
          ]
        },
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              safe: { type: Type.BOOLEAN },
              reason: { type: Type.STRING }
            },
            propertyOrdering: ["safe", "reason"]
          }
        }
      });

      const text = response.text;
      return JSON.parse(text || '{"safe":true,"reason":null}');
    } catch {
      return { safe: true, reason: null }; // Default to safe if moderation service fails
    }
  }
};
