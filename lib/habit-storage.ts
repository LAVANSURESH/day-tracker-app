/**
 * AsyncStorage service for habit entries and completions
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { HabitEntry, HabitCompletion, CreateHabitInput, UpdateHabitInput, HabitStats } from "@/shared/types";

const HABITS_KEY = "day_tracker_habits";
const COMPLETIONS_KEY = "day_tracker_habit_completions";

// Habit Management
export async function getAllHabits(): Promise<HabitEntry[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    if (!data) return [];
    return JSON.parse(data) as HabitEntry[];
  } catch (error) {
    console.error("Error reading habits:", error);
    return [];
  }
}

export async function getHabitById(id: string): Promise<HabitEntry | null> {
  try {
    const habits = await getAllHabits();
    return habits.find((h) => h.id === id) || null;
  } catch (error) {
    console.error("Error reading habit:", error);
    return null;
  }
}

export async function createHabit(input: CreateHabitInput): Promise<HabitEntry> {
  try {
    const habits = await getAllHabits();
    const newHabit: HabitEntry = {
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    habits.unshift(newHabit);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    return newHabit;
  } catch (error) {
    console.error("Error creating habit:", error);
    throw error;
  }
}

export async function updateHabit(id: string, updates: UpdateHabitInput): Promise<HabitEntry | null> {
  try {
    const habits = await getAllHabits();
    const index = habits.findIndex((h) => h.id === id);

    if (index === -1) return null;

    const updatedHabit: HabitEntry = {
      ...habits[index],
      ...updates,
      id: habits[index].id,
      createdAt: habits[index].createdAt,
      updatedAt: Date.now(),
    };

    habits[index] = updatedHabit;
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    return updatedHabit;
  } catch (error) {
    console.error("Error updating habit:", error);
    throw error;
  }
}

export async function deleteHabit(id: string): Promise<boolean> {
  try {
    const habits = await getAllHabits();
    const filtered = habits.filter((h) => h.id !== id);

    if (filtered.length === habits.length) return false;

    // Also delete all completions for this habit
    const completions = await getAllCompletions();
    const filteredCompletions = completions.filter((c) => c.habitId !== id);
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(filteredCompletions));

    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw error;
  }
}

// Habit Completion Management
export async function getAllCompletions(): Promise<HabitCompletion[]> {
  try {
    const data = await AsyncStorage.getItem(COMPLETIONS_KEY);
    if (!data) return [];
    return JSON.parse(data) as HabitCompletion[];
  } catch (error) {
    console.error("Error reading completions:", error);
    return [];
  }
}

export async function getCompletionsByHabit(habitId: string): Promise<HabitCompletion[]> {
  try {
    const completions = await getAllCompletions();
    return completions.filter((c) => c.habitId === habitId);
  } catch (error) {
    console.error("Error reading completions by habit:", error);
    return [];
  }
}

export async function getCompletionByDate(habitId: string, date: string): Promise<HabitCompletion | null> {
  try {
    const completions = await getAllCompletions();
    return completions.find((c) => c.habitId === habitId && c.date === date) || null;
  } catch (error) {
    console.error("Error reading completion by date:", error);
    return null;
  }
}

export async function toggleHabitCompletion(habitId: string, date: string, notes?: string): Promise<HabitCompletion> {
  try {
    const completions = await getAllCompletions();
    const existing = completions.find((c) => c.habitId === habitId && c.date === date);

    if (existing) {
      existing.completed = !existing.completed;
      if (notes) existing.notes = notes;
    } else {
      const newCompletion: HabitCompletion = {
        id: `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        habitId,
        date,
        completed: true,
        notes,
        createdAt: Date.now(),
      };
      completions.push(newCompletion);
    }

    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
    return existing || completions[completions.length - 1];
  } catch (error) {
    console.error("Error toggling habit completion:", error);
    throw error;
  }
}

// Statistics
export async function calculateHabitStats(): Promise<HabitStats> {
  try {
    const habits = await getAllHabits();
    const completions = await getAllCompletions();

    if (habits.length === 0) {
      return {
        totalHabits: 0,
        completionRate: 0,
        currentStreaks: {},
      };
    }

    const currentStreaks: Record<string, number> = {};
    let totalCompleted = 0;

    habits.forEach((habit) => {
      const habitCompletions = completions.filter((c) => c.habitId === habit.id && c.completed);
      totalCompleted += habitCompletions.length;

      // Calculate current streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sorted = habitCompletions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      for (const completion of sorted) {
        const completionDate = new Date(completion.date + "T00:00:00");
        const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === streak) {
          streak++;
        } else {
          break;
        }
      }

      currentStreaks[habit.id] = streak;
    });

    const completionRate = habits.length > 0 ? (totalCompleted / (habits.length * 30)) * 100 : 0;

    return {
      totalHabits: habits.length,
      completionRate: Math.min(100, Math.round(completionRate)),
      currentStreaks,
    };
  } catch (error) {
    console.error("Error calculating habit stats:", error);
    return {
      totalHabits: 0,
      completionRate: 0,
      currentStreaks: {},
    };
  }
}

export async function clearAllHabits(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HABITS_KEY);
    await AsyncStorage.removeItem(COMPLETIONS_KEY);
  } catch (error) {
    console.error("Error clearing habits:", error);
    throw error;
  }
}
