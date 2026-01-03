/**
 * AsyncStorage service for exercise entries
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExerciseEntry, CreateExerciseInput, UpdateExerciseInput, ExerciseStats, ExerciseType } from "@/shared/types";

const EXERCISES_KEY = "day_tracker_exercises";

export async function getAllExercises(): Promise<ExerciseEntry[]> {
  try {
    const data = await AsyncStorage.getItem(EXERCISES_KEY);
    if (!data) return [];
    return JSON.parse(data) as ExerciseEntry[];
  } catch (error) {
    console.error("Error reading exercises:", error);
    return [];
  }
}

export async function getExerciseById(id: string): Promise<ExerciseEntry | null> {
  try {
    const exercises = await getAllExercises();
    return exercises.find((e) => e.id === id) || null;
  } catch (error) {
    console.error("Error reading exercise:", error);
    return null;
  }
}

export async function getExercisesByDate(date: string): Promise<ExerciseEntry[]> {
  try {
    const exercises = await getAllExercises();
    return exercises.filter((e) => e.date === date);
  } catch (error) {
    console.error("Error reading exercises by date:", error);
    return [];
  }
}

export async function getExercisesByType(type: ExerciseType): Promise<ExerciseEntry[]> {
  try {
    const exercises = await getAllExercises();
    return exercises.filter((e) => e.type === type);
  } catch (error) {
    console.error("Error reading exercises by type:", error);
    return [];
  }
}

export async function createExercise(input: CreateExerciseInput): Promise<ExerciseEntry> {
  try {
    const exercises = await getAllExercises();
    const newExercise: ExerciseEntry = {
      id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    exercises.unshift(newExercise);
    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
    return newExercise;
  } catch (error) {
    console.error("Error creating exercise:", error);
    throw error;
  }
}

export async function updateExercise(id: string, updates: UpdateExerciseInput): Promise<ExerciseEntry | null> {
  try {
    const exercises = await getAllExercises();
    const index = exercises.findIndex((e) => e.id === id);

    if (index === -1) return null;

    const updatedExercise: ExerciseEntry = {
      ...exercises[index],
      ...updates,
      id: exercises[index].id,
      createdAt: exercises[index].createdAt,
      updatedAt: Date.now(),
    };

    exercises[index] = updatedExercise;
    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
    return updatedExercise;
  } catch (error) {
    console.error("Error updating exercise:", error);
    throw error;
  }
}

export async function deleteExercise(id: string): Promise<boolean> {
  try {
    const exercises = await getAllExercises();
    const filtered = exercises.filter((e) => e.id !== id);

    if (filtered.length === exercises.length) return false;

    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting exercise:", error);
    throw error;
  }
}

export async function calculateExerciseStats(): Promise<ExerciseStats> {
  try {
    const exercises = await getAllExercises();

    if (exercises.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        totalDistance: 0,
        totalCalories: 0,
        averagePerWeek: 0,
      };
    }

    let totalDuration = 0;
    let totalDistance = 0;
    let totalCalories = 0;

    exercises.forEach((exercise) => {
      totalDuration += exercise.duration;
      if (exercise.distance) totalDistance += exercise.distance;
      if (exercise.calories) totalCalories += exercise.calories;
    });

    // Calculate average per week
    const uniqueDates = new Set(exercises.map((e) => e.date));
    const weeks = Math.ceil(uniqueDates.size / 7);
    const averagePerWeek = exercises.length / Math.max(weeks, 1);

    return {
      totalWorkouts: exercises.length,
      totalDuration,
      totalDistance,
      totalCalories,
      averagePerWeek: Math.round(averagePerWeek * 10) / 10,
    };
  } catch (error) {
    console.error("Error calculating exercise stats:", error);
    return {
      totalWorkouts: 0,
      totalDuration: 0,
      totalDistance: 0,
      totalCalories: 0,
      averagePerWeek: 0,
    };
  }
}

export async function clearAllExercises(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EXERCISES_KEY);
  } catch (error) {
    console.error("Error clearing exercises:", error);
    throw error;
  }
}
