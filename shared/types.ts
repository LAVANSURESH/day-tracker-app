/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Day Tracker Types
export type MoodType = "happy" | "sad" | "neutral" | "anxious" | "excited" | "grateful";
export type ExpenseCategory = "food" | "transport" | "entertainment" | "utilities" | "health" | "shopping" | "other";
export type HabitFrequency = "daily" | "weekly" | "monthly";
export type ExerciseType = "running" | "cycling" | "gym" | "yoga" | "swimming" | "sports" | "walking" | "other";

// Journal Entry
export interface JournalEntry {
  id: string;
  date: string;
  mood: MoodType;
  title?: string;
  content: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// Expense Entry
export interface ExpenseEntry {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// Habit Entry
export interface HabitEntry {
  id: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  createdAt: number;
  updatedAt: number;
}

// Habit Completion
export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt: number;
}

// Exercise Entry
export interface ExerciseEntry {
  id: string;
  date: string;
  type: ExerciseType;
  duration: number;
  distance?: number;
  calories?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Input Types
export type CreateJournalInput = Omit<JournalEntry, "id" | "createdAt" | "updatedAt">;
export type UpdateJournalInput = Partial<Omit<JournalEntry, "id" | "createdAt">>;

export type CreateExpenseInput = Omit<ExpenseEntry, "id" | "createdAt" | "updatedAt">;
export type UpdateExpenseInput = Partial<Omit<ExpenseEntry, "id" | "createdAt">>;

export type CreateHabitInput = Omit<HabitEntry, "id" | "createdAt" | "updatedAt">;
export type UpdateHabitInput = Partial<Omit<HabitEntry, "id" | "createdAt">>;

export type CreateExerciseInput = Omit<ExerciseEntry, "id" | "createdAt" | "updatedAt">;
export type UpdateExerciseInput = Partial<Omit<ExerciseEntry, "id" | "createdAt">>;

// Stats
export interface DayTrackerStats {
  totalEntries: number;
  currentStreak: number;
  moodDistribution: Record<MoodType, number>;
  lastEntryDate?: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  averagePerDay: number;
  lastExpenseDate?: string;
}

export interface HabitStats {
  totalHabits: number;
  completionRate: number;
  currentStreaks: Record<string, number>;
}

export interface ExerciseStats {
  totalWorkouts: number;
  totalDuration: number;
  totalDistance: number;
  totalCalories: number;
  averagePerWeek: number;
}
