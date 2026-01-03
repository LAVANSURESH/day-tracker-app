/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Day Tracker Journal Types
export type MoodType = "happy" | "sad" | "neutral" | "anxious" | "excited" | "grateful";

export interface JournalEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mood: MoodType;
  title?: string;
  content: string;
  tags?: string[];
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export type CreateEntryInput = Omit<JournalEntry, "id" | "createdAt" | "updatedAt">;
export type UpdateEntryInput = Partial<Omit<JournalEntry, "id" | "createdAt">>;

export interface DayTrackerStats {
  totalEntries: number;
  currentStreak: number;
  moodDistribution: Record<MoodType, number>;
  lastEntryDate?: string;
}
