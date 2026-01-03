/**
 * Journal Context Provider
 * Manages global state for journal entries
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { JournalEntry, CreateEntryInput, UpdateEntryInput, DayTrackerStats } from "@/shared/types";
import * as storage from "./storage";

interface JournalState {
  entries: JournalEntry[];
  stats: DayTrackerStats;
  loading: boolean;
  error: string | null;
}

type JournalAction =
  | { type: "SET_ENTRIES"; payload: JournalEntry[] }
  | { type: "SET_STATS"; payload: DayTrackerStats }
  | { type: "ADD_ENTRY"; payload: JournalEntry }
  | { type: "UPDATE_ENTRY"; payload: JournalEntry }
  | { type: "DELETE_ENTRY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

interface JournalContextType {
  state: JournalState;
  loadEntries: () => Promise<void>;
  createEntry: (input: CreateEntryInput) => Promise<JournalEntry>;
  updateEntry: (id: string, updates: UpdateEntryInput) => Promise<JournalEntry | null>;
  deleteEntry: (id: string) => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

const initialState: JournalState = {
  entries: [],
  stats: {
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
  },
  loading: false,
  error: null,
};

function journalReducer(state: JournalState, action: JournalAction): JournalState {
  switch (action.type) {
    case "SET_ENTRIES":
      return { ...state, entries: action.payload, error: null };
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "ADD_ENTRY":
      return { ...state, entries: [action.payload, ...state.entries] };
    case "UPDATE_ENTRY": {
      const index = state.entries.findIndex((e) => e.id === action.payload.id);
      if (index === -1) return state;
      const updated = [...state.entries];
      updated[index] = action.payload;
      return { ...state, entries: updated };
    }
    case "DELETE_ENTRY":
      return { ...state, entries: state.entries.filter((e) => e.id !== action.payload) };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(journalReducer, initialState);

  const loadEntries = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const entries = await storage.getAllEntries();
      dispatch({ type: "SET_ENTRIES", payload: entries });

      const stats = await storage.calculateStats();
      dispatch({ type: "SET_STATS", payload: stats });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load entries" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const createEntry = useCallback(async (input: CreateEntryInput) => {
    try {
      const newEntry = await storage.createEntry(input);
      dispatch({ type: "ADD_ENTRY", payload: newEntry });

      const stats = await storage.calculateStats();
      dispatch({ type: "SET_STATS", payload: stats });

      return newEntry;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateEntry = useCallback(async (id: string, updates: UpdateEntryInput) => {
    try {
      const updated = await storage.updateEntry(id, updates);
      if (updated) {
        dispatch({ type: "UPDATE_ENTRY", payload: updated });

        const stats = await storage.calculateStats();
        dispatch({ type: "SET_STATS", payload: stats });
      }
      return updated;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const success = await storage.deleteEntry(id);
      if (success) {
        dispatch({ type: "DELETE_ENTRY", payload: id });

        const stats = await storage.calculateStats();
        dispatch({ type: "SET_STATS", payload: stats });
      }
      return success;
    } catch (error) {
      throw error;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const stats = await storage.calculateStats();
      dispatch({ type: "SET_STATS", payload: stats });
    } catch (error) {
      console.error("Error refreshing stats:", error);
    }
  }, []);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const value: JournalContextType = {
    state,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    refreshStats,
  };

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error("useJournal must be used within JournalProvider");
  }
  return context;
}
