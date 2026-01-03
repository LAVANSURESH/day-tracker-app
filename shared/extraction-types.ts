/**
 * Types for AI-powered extraction from journal entries
 */

// Extracted Exercise Item
export interface ExtractedExercise {
  type: "running" | "cycling" | "gym" | "yoga" | "swimming" | "sports" | "walking" | "other";
  duration: number; // in minutes
  distance?: number; // in km
  intensity?: "light" | "moderate" | "high";
  notes?: string;
  confidence: number; // 0-1
}

// Extracted Habit Item
export interface ExtractedHabit {
  name: string;
  completed: boolean;
  frequency?: "daily" | "weekly" | "monthly";
  notes?: string;
  confidence: number; // 0-1
}

// Extracted Expense Item
export interface ExtractedExpense {
  category: "food" | "transport" | "entertainment" | "utilities" | "health" | "shopping" | "other";
  amount: number;
  description?: string;
  confidence: number; // 0-1
}

// Extracted Activity Item
export interface ExtractedActivity {
  type: "activity" | "event" | "milestone";
  title: string;
  mood?: "happy" | "sad" | "neutral" | "anxious" | "excited" | "grateful";
  tags?: string[];
  notes?: string;
  confidence: number; // 0-1
}

// Complete extraction result
export interface ExtractionResult {
  journalEntryId: string;
  extractedAt: number; // timestamp
  exercises: ExtractedExercise[];
  habits: ExtractedHabit[];
  expenses: ExtractedExpense[];
  activities: ExtractedActivity[];
  rawText: string;
  extractionModel: string;
  processingTimeMs: number;
}

// Request to extract from journal text
export interface ExtractionRequest {
  journalText: string;
  date: string; // YYYY-MM-DD
  mood?: string;
}

// Response from extraction API
export interface ExtractionResponse {
  success: boolean;
  extraction?: ExtractionResult;
  error?: string;
  message?: string;
}
