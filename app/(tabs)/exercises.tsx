import { ScrollView, Text, View, TouchableOpacity, FlatList, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as exerciseStorage from "@/lib/exercise-storage";
import { ExerciseEntry, ExerciseStats, ExerciseType } from "@/shared/types";
import { Link } from "expo-router";

const EXERCISE_ICONS: Record<ExerciseType, string> = {
  running: "🏃",
  cycling: "🚴",
  gym: "🏋️",
  yoga: "🧘",
  swimming: "🏊",
  sports: "⚽",
  walking: "🚶",
  other: "💪",
};

const EXERCISE_LABELS: Record<ExerciseType, string> = {
  running: "Running",
  cycling: "Cycling",
  gym: "Gym",
  yoga: "Yoga",
  swimming: "Swimming",
  sports: "Sports",
  walking: "Walking",
  other: "Other",
};

export default function ExercisesScreen() {
  const colors = useColors();
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const allExercises = await exerciseStorage.getAllExercises();
      const exerciseStats = await exerciseStorage.calculateExerciseStats();
      setExercises(allExercises);
      setStats(exerciseStats);
    } catch (error) {
      console.error("Error loading exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    try {
      await exerciseStorage.deleteExercise(id);
      await loadExercises();
    } catch (error) {
      console.error("Error deleting exercise:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <ScreenContainer className="p-4">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-foreground mb-2">Exercises</Text>
        {stats && (
          <Text className="text-base text-muted">
            {stats.totalWorkouts} workouts • {stats.totalDuration} min
          </Text>
        )}
      </View>

      {stats && (
        <View className="mb-6 bg-surface rounded-2xl p-4 border border-border">
          <View className="grid grid-cols-2 gap-4 mb-4">
            <View>
              <Text className="text-sm text-muted mb-1">Total Workouts</Text>
              <Text className="text-2xl font-bold text-foreground">{stats.totalWorkouts}</Text>
            </View>
            <View>
              <Text className="text-sm text-muted mb-1">Total Duration</Text>
              <Text className="text-2xl font-bold text-foreground">{stats.totalDuration}m</Text>
            </View>
          </View>

          {stats.totalDistance > 0 && (
            <View className="border-t border-border pt-4">
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className="text-sm text-muted mb-1">Distance</Text>
                  <Text className="text-xl font-bold text-foreground">{stats.totalDistance.toFixed(1)} km</Text>
                </View>
                {stats.totalCalories > 0 && (
                  <View className="flex-1">
                    <Text className="text-sm text-muted mb-1">Calories</Text>
                    <Text className="text-xl font-bold text-foreground">{stats.totalCalories}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View className="border-t border-border pt-4 mt-4">
            <Text className="text-sm text-muted mb-1">Average per Week</Text>
            <Text className="text-xl font-bold text-foreground">{stats.averagePerWeek} workouts</Text>
          </View>
        </View>
      )}

      {exercises.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-5xl mb-4">💪</Text>
          <Text className="text-lg font-semibold text-foreground mb-2">No exercises yet</Text>
          <Text className="text-sm text-muted text-center mb-6">Log your workouts to track progress</Text>
          <Link href="/create-exercise" asChild>
            <TouchableOpacity className="bg-primary px-6 py-3 rounded-full">
              <Text className="text-background font-semibold">Log Exercise</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View className="mb-3 bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-2xl mr-2">{EXERCISE_ICONS[item.type]}</Text>
                    <Text className="text-base font-semibold text-foreground">{EXERCISE_LABELS[item.type]}</Text>
                  </View>
                  <Text className="text-xs text-muted">{formatDate(item.date)}</Text>
                </View>
                <Pressable
                  onPress={() => handleDeleteExercise(item.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text className="text-xs text-error">Delete</Text>
                </Pressable>
              </View>

              <View className="flex-row gap-4 mt-3 pt-3 border-t border-border">
                <View>
                  <Text className="text-xs text-muted">Duration</Text>
                  <Text className="text-sm font-semibold text-foreground">{item.duration} min</Text>
                </View>
                {item.distance && (
                  <View>
                    <Text className="text-xs text-muted">Distance</Text>
                    <Text className="text-sm font-semibold text-foreground">{item.distance} km</Text>
                  </View>
                )}
                {item.calories && (
                  <View>
                    <Text className="text-xs text-muted">Calories</Text>
                    <Text className="text-sm font-semibold text-foreground">{item.calories}</Text>
                  </View>
                )}
              </View>

              {item.notes && <Text className="text-sm text-muted mt-3">{item.notes}</Text>}
            </View>
          )}
        />
      )}

      <Link href="/create-exercise" asChild>
        <TouchableOpacity className="mt-6 bg-primary py-3 rounded-full items-center">
          <Text className="text-background font-semibold">+ Log Exercise</Text>
        </TouchableOpacity>
      </Link>
    </ScreenContainer>
  );
}
