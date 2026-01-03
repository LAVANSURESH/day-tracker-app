/**
 * AsyncStorage service for journal entries
 * Handles persistence of journal data locally on device
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { JournalEntry, CreateJournalInput, UpdateJournalInput, DayTrackerStats, MoodType } from "@/shared/types";

const ENTRIES_KEY = "day_tracker_entries";

/**
 * Get all journal entries
 */
export async function getAllEntries(): Promise<JournalEntry[]> {
  try {
    const data = await AsyncStorage.getItem(ENTRIES_KEY);
    if (!data) return [];
    return JSON.parse(data) as JournalEntry[];
  } catch (error) {
    console.error("Error reading entries:", error);
    return [];
  }
}

/**
 * Get a single entry by ID
 */
export async function getEntryById(id: string): Promise<JournalEntry | null> {
  try {
    const entries = await getAllEntries();
    return entries.find((e) => e.id === id) || null;
  } catch (error) {
    console.error("Error reading entry:", error);
    return null;
  }
}

/**
 * Get entries for a specific date
 */
export async function getEntriesByDate(date: string): Promise<JournalEntry[]> {
  try {
    const entries = await getAllEntries();
    return entries.filter((e) => e.date === date);
  } catch (error) {
    console.error("Error reading entries by date:", error);
    return [];
  }
}

/**
 * Create a new journal entry
 */
export async function createEntry(input: CreateJournalInput): Promise<JournalEntry> {
  try {
    const entries = await getAllEntries();
    const newEntry: JournalEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Add new entry to the beginning (most recent first)
    entries.unshift(newEntry);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    return newEntry;
  } catch (error) {
    console.error("Error creating entry:", error);
    throw error;
  }
}

/**
 * Update an existing journal entry
 */
export async function updateEntry(id: string, updates: UpdateJournalInput): Promise<JournalEntry | null> {
  try {
    const entries = await getAllEntries();
    const index = entries.findIndex((e) => e.id === id);

    if (index === -1) return null;

    const updatedEntry: JournalEntry = {
      ...entries[index],
      ...updates,
      id: entries[index].id, // preserve ID
      createdAt: entries[index].createdAt, // preserve creation time
      updatedAt: Date.now(),
    };

    entries[index] = updatedEntry;
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    return updatedEntry;
  } catch (error) {
    console.error("Error updating entry:", error);
    throw error;
  }
}

/**
 * Delete a journal entry
 */
export async function deleteEntry(id: string): Promise<boolean> {
  try {
    const entries = await getAllEntries();
    const filtered = entries.filter((e) => e.id !== id);

    if (filtered.length === entries.length) return false; // entry not found

    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting entry:", error);
    throw error;
  }
}

/**
 * Calculate statistics from all entries
 */
export async function calculateStats(): Promise<DayTrackerStats> {
  try {
    const entries = await getAllEntries();

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        currentStreak: 0,
        moodDistribution: {
          happy: 0,
          sad: 0,
          neutral: 0,
          anxious: 0,
          excited: 0,
          grateful: 0,
        },
      };
    }

    // Sort entries by date (newest first)
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate mood distribution
    const moodDistribution: Record<MoodType, number> = {
      happy: 0,
      sad: 0,
      neutral: 0,
      anxious: 0,
      excited: 0,
      grateful: 0,
    };

    entries.forEach((entry) => {
      moodDistribution[entry.mood]++;
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const entry of sorted) {
      const entryDate = new Date(entry.date + "T00:00:00");
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalEntries: entries.length,
      currentStreak,
      moodDistribution,
      lastEntryDate: sorted[0]?.date,
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    return {
      totalEntries: 0,
      currentStreak: 0,
      moodDistribution: {
        happy: 0,
        sad: 0,
        neutral: 0,
        anxious: 0,
        excited: 0,
        grateful: 0,
      },
    };
  }
}

/**
 * Clear all entries (for testing/reset)
 */
export async function clearAllEntries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ENTRIES_KEY);
  } catch (error) {
    console.error("Error clearing entries:", error);
    throw error;
  }
}
