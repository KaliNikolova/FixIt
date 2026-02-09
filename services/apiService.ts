/**
 * API service for communicating with the FastAPI backend.
 * Replaces direct Gemini calls and localStorage with server-side operations.
 */

const API_BASE_URL = 'http://localhost:8000';

export const apiService = {
    // ============ Gemini AI Endpoints ============

    async analyzeImage(photoBase64: string, userText: string = ''): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/gemini/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoBase64, userText })
        });
        if (!response.ok) throw new Error('Analysis failed');
        return response.json();
    },

    async findManual(objectName: string): Promise<string | null> {
        const response = await fetch(`${API_BASE_URL}/gemini/manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ objectName })
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.url;
    },

    async generateStepImage(
        objectName: string,
        stepDescription: string,
        idealView: string,
        referenceImageBase64?: string
    ): Promise<string | null> {
        const response = await fetch(`${API_BASE_URL}/gemini/generate-step-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ objectName, stepDescription, idealView, referenceImageBase64 })
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.imageUrl;
    },

    async troubleshoot(
        photoBase64: string,
        objectName: string,
        stepIndex: number,
        currentStepText: string
    ): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/gemini/troubleshoot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoBase64, objectName, stepIndex, currentStepText })
        });
        if (!response.ok) {
            return "I'm having trouble analyzing the live feed. Please double-check your tools and the instruction text.";
        }
        const data = await response.json();
        return data.advice;
    },

    async moderateImage(photoBase64: string): Promise<{ safe: boolean; reason: string | null }> {
        const response = await fetch(`${API_BASE_URL}/gemini/moderate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoBase64 })
        });
        if (!response.ok) return { safe: true, reason: null };
        return response.json();
    },

    // ============ Repair CRUD Endpoints ============

    async saveRepair(repair: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/repairs/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(repair)
        });
        if (!response.ok) throw new Error('Failed to save repair');
        return response.json();
    },

    async getAllRepairs(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/repairs/`);
        if (!response.ok) return [];
        return response.json();
    },

    async getPublicRepairs(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/repairs/public`);
        if (!response.ok) return [];
        return response.json();
    },

    async getRepair(repairId: string): Promise<any | null> {
        const response = await fetch(`${API_BASE_URL}/repairs/${repairId}`);
        if (!response.ok) return null;
        return response.json();
    },

    async deleteRepair(repairId: string): Promise<boolean> {
        const response = await fetch(`${API_BASE_URL}/repairs/${repairId}`, {
            method: 'DELETE'
        });
        return response.ok;
    }
};
