import { ScrollView, Text, View, TouchableOpacity, FlatList, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as habitStorage from "@/lib/habit-storage";
import { HabitEntry, HabitStats, HabitFrequency } from "@/shared/types";
import { Link } from "expo-router";

const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export default function HabitsScreen() {
  const colors = useColors();
  const [habits, setHabits] = useState<HabitEntry[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setLoading(true);
    try {
      const allHabits = await habitStorage.getAllHabits();
      const habitStats = await habitStorage.calculateHabitStats();
      setHabits(allHabits);
      setStats(habitStats);

      // Load today's completions
      const today = new Date().toISOString().split("T")[0];
      const completed = new Set<string>();
      for (const habit of allHabits) {
        const completion = await habitStorage.getCompletionByDate(habit.id, today);
        if (completion?.completed) {
          completed.add(habit.id);
        }
      }
      setCompletedToday(completed);
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await habitStorage.toggleHabitCompletion(habitId, today);
      await loadHabits();
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await habitStorage.deleteHabit(id);
      await loadHabits();
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-foreground mb-2">Habits</Text>
        {stats && (
          <Text className="text-base text-muted">
            {stats.totalHabits} habits • {stats.completionRate}% completion
          </Text>
        )}
      </View>

      {stats && (
        <View className="mb-6 bg-surface rounded-2xl p-4 border border-border">
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">Total Habits</Text>
              <Text className="text-2xl font-bold text-foreground">{stats.totalHabits}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">Completion Rate</Text>
              <Text className="text-2xl font-bold text-foreground">{stats.completionRate}%</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">Best Streak</Text>
              <Text className="text-2xl font-bold text-foreground">
                {Math.max(...Object.values(stats.currentStreaks), 0)} days
              </Text>
            </View>
          </View>
        </View>
      )}

      {habits.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-5xl mb-4">✓</Text>
          <Text className="text-lg font-semibold text-foreground mb-2">No habits yet</Text>
          <Text className="text-sm text-muted text-center mb-6">Build habits by creating your first one</Text>
          <Link href="/create-habit" asChild>
            <TouchableOpacity className="bg-primary px-6 py-3 rounded-full">
              <Text className="text-background font-semibold">Create Habit</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View className="mb-3 bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                  <Text className="text-xs text-muted mt-1">{FREQUENCY_LABELS[item.frequency]}</Text>
                </View>
                <Pressable
                  onPress={() => handleToggleHabit(item.id)}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                      backgroundColor: completedToday.has(item.id) ? colors.success : colors.border,
                    },
                  ]}
                  className="w-12 h-12 rounded-full items-center justify-center"
                >
                  <Text className="text-xl">{completedToday.has(item.id) ? "✓" : "○"}</Text>
                </Pressable>
              </View>

              {item.description && <Text className="text-sm text-muted mb-3">{item.description}</Text>}

              {stats?.currentStreaks[item.id] !== undefined && (
                <View className="bg-background rounded-lg px-3 py-2 mb-3">
                  <Text className="text-xs text-muted">
                    Current streak: <Text className="font-bold text-foreground">{stats.currentStreaks[item.id]} days</Text>
                  </Text>
                </View>
              )}

              <Pressable
                onPress={() => handleDeleteHabit(item.id)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <Text className="text-xs text-error">Delete</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Link href="/create-habit" asChild>
        <TouchableOpacity className="mt-6 bg-primary py-3 rounded-full items-center">
          <Text className="text-background font-semibold">+ Create Habit</Text>
        </TouchableOpacity>
      </Link>
    </ScreenContainer>
  );
}
