/**
 * Unit tests for storage service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  calculateStats,
  clearAllEntries,
} from "@/lib/storage";
import { JournalEntry, MoodType } from "@/shared/types";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as any;

describe("Storage Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllEntries", () => {
    it("should return empty array when no entries exist", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      const result = await getAllEntries();
      expect(result).toEqual([]);
    });

    it("should return parsed entries from storage", async () => {
      const mockEntries: JournalEntry[] = [
        {
          id: "1",
          date: "2024-01-15",
          mood: "happy",
          content: "Great day!",
          createdAt: 1705276800000,
          updatedAt: 1705276800000,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockEntries));
      const result = await getAllEntries();
      expect(result).toEqual(mockEntries);
    });

    it("should handle errors gracefully", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));
      const result = await getAllEntries();
      expect(result).toEqual([]);
    });
  });

  describe("getEntryById", () => {
    it("should return entry if found", async () => {
      const mockEntry: JournalEntry = {
        id: "1",
        date: "2024-01-15",
        mood: "happy",
        content: "Great day!",
        createdAt: 1705276800000,
        updatedAt: 1705276800000,
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockEntry]));
      const result = await getEntryById("1");
      expect(result).toEqual(mockEntry);
    });

    it("should return null if entry not found", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
      const result = await getEntryById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("createEntry", () => {
    it("should create a new entry with generated ID", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await createEntry({
        date: "2024-01-15",
        mood: "happy",
        content: "Test entry",
      });

      expect(result.id).toBeDefined();
      expect(result.date).toBe("2024-01-15");
      expect(result.mood).toBe("happy");
      expect(result.content).toBe("Test entry");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should add entry to existing entries", async () => {
      const existingEntry: JournalEntry = {
        id: "1",
        date: "2024-01-14",
        mood: "sad",
        content: "Sad day",
        createdAt: 1705190400000,
        updatedAt: 1705190400000,
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([existingEntry]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await createEntry({
        date: "2024-01-15",
        mood: "happy",
        content: "Happy day",
      });

      const savedData = mockAsyncStorage.setItem.mock.calls[0][1];
      const parsed = JSON.parse(savedData);
      expect(parsed).toHaveLength(2);
      // New entry is added to the front
      expect(parsed[0].date).toBe("2024-01-15");
      expect(parsed[1].date).toBe("2024-01-14");
    });
  });

  describe("updateEntry", () => {
    it("should update entry if found", async () => {
      const entry: JournalEntry = {
        id: "1",
        date: "2024-01-15",
        mood: "happy",
        content: "Original content",
        createdAt: 1705276800000,
        updatedAt: 1705276800000,
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([entry]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await updateEntry("1", {
        content: "Updated content",
      });

      expect(result?.content).toBe("Updated content");
      expect(result?.id).toBe("1");
      expect(result?.createdAt).toBe(entry.createdAt);
      expect(result?.updatedAt).toBeGreaterThanOrEqual(entry.updatedAt);
    });

    it("should return null if entry not found", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
      const result = await updateEntry("nonexistent", { content: "New" });
      expect(result).toBeNull();
    });
  });

  describe("deleteEntry", () => {
    it("should delete entry if found", async () => {
      const entry: JournalEntry = {
        id: "1",
        date: "2024-01-15",
        mood: "happy",
        content: "To delete",
        createdAt: 1705276800000,
        updatedAt: 1705276800000,
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([entry]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await deleteEntry("1");
      expect(result).toBe(true);

      const savedData = mockAsyncStorage.setItem.mock.calls[0][1];
      const parsed = JSON.parse(savedData);
      expect(parsed).toHaveLength(0);
    });

    it("should return false if entry not found", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
      const result = await deleteEntry("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("calculateStats", () => {
    it("should return zero stats for empty entries", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
      const result = await calculateStats();

      expect(result.totalEntries).toBe(0);
      expect(result.currentStreak).toBe(0);
      expect(result.moodDistribution.happy).toBe(0);
    });

    it("should calculate mood distribution correctly", async () => {
      const entries: JournalEntry[] = [
        {
          id: "1",
          date: "2024-01-15",
          mood: "happy",
          content: "Happy",
          createdAt: 1705276800000,
          updatedAt: 1705276800000,
        },
        {
          id: "2",
          date: "2024-01-14",
          mood: "happy",
          content: "Happy",
          createdAt: 1705190400000,
          updatedAt: 1705190400000,
        },
        {
          id: "3",
          date: "2024-01-13",
          mood: "sad",
          content: "Sad",
          createdAt: 1705104000000,
          updatedAt: 1705104000000,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entries));

      const result = await calculateStats();
      expect(result.totalEntries).toBe(3);
      expect(result.moodDistribution.happy).toBe(2);
      expect(result.moodDistribution.sad).toBe(1);
    });

    it("should calculate current streak correctly", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const entries: JournalEntry[] = [
        {
          id: "1",
          date: today.toISOString().split("T")[0],
          mood: "happy",
          content: "Today",
          createdAt: today.getTime(),
          updatedAt: today.getTime(),
        },
        {
          id: "2",
          date: new Date(today.getTime() - 86400000).toISOString().split("T")[0],
          mood: "happy",
          content: "Yesterday",
          createdAt: today.getTime() - 86400000,
          updatedAt: today.getTime() - 86400000,
        },
        {
          id: "3",
          date: new Date(today.getTime() - 172800000).toISOString().split("T")[0],
          mood: "happy",
          content: "Two days ago",
          createdAt: today.getTime() - 172800000,
          updatedAt: today.getTime() - 172800000,
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entries));

      const result = await calculateStats();
      // Streak calculation starts from today and counts consecutive days
      expect(result.currentStreak).toBeGreaterThanOrEqual(1);
    });
  });

  describe("clearAllEntries", () => {
    it("should remove entries from storage", async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);
      await clearAllEntries();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("day_tracker_entries");
    });
  });
});
