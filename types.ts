
export enum RepairStatus {
  OK = 'ok',
  UNSAFE = 'unsafe',
  UNCLEAR = 'unclear'
}

export type RepairCategory = 'electronics' | 'plumbing' | 'appliance' | 'furniture' | 'other';

export interface RepairStep {
  stepNumber: number;
  instruction: string;
  visualDescription: string;
  generatedImageUrl?: string;
}

export interface RepairAnalysis {
  status: RepairStatus;
  objectName: string;
  category: RepairCategory;
  issueType: string;
  safetyWarning: string | null;
  toolsNeeded: boolean;
  idealViewInstruction: string;
  steps: RepairStep[];
}

export interface RepairDocument extends RepairAnalysis {
  repairId: string;
  timestamp: number;
  isPublic: boolean;
  isSuccessful: boolean | null;
  userPhotoUrl: string; // base64
  idealViewImageUrl?: string;
  // Fix: Adding manualUrl to RepairDocument interface to support grounding metadata links
  manualUrl?: string | null;
}