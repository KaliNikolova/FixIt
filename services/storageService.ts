
import { RepairDocument } from "../types";

const STORAGE_KEY = 'vrc_repairs_store';

export const storageService = {
  saveRepair(doc: RepairDocument) {
    const existing = this.getAllRepairs();
    const updated = [doc, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getAllRepairs(): RepairDocument[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  getPublicRepairs(): RepairDocument[] {
    return this.getAllRepairs().filter(r => r.isPublic);
  }
};
