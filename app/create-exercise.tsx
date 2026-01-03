import { ScrollView, Text, View, TouchableOpacity, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as exerciseStorage from "@/lib/exercise-storage";
import { ExerciseType } from "@/shared/types";
import { useRouter } from "expo-router";

const EXERCISE_TYPES: ExerciseType[] = ["running", "cycling", "gym", "yoga", "swimming", "sports", "walking", "other"];

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

export default function CreateExerciseScreen() {
  const colors = useColors();
  const router = useRouter();
  const [type, setType] = useState<ExerciseType>("running");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!duration || isNaN(parseInt(duration))) {
      alert("Please enter a valid duration in minutes");
      return;
    }

    setSaving(true);
    try {
      await exerciseStorage.createExercise({
        date,
        type,
        duration: parseInt(duration),
        distance: distance ? parseFloat(distance) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        notes: notes || undefined,
      });
      router.back();
    } catch (error) {
      console.error("Error saving exercise:", error);
      alert("Failed to save exercise");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="text-3xl font-bold text-foreground mb-6">Log Exercise</Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Exercise Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {EXERCISE_TYPES.map((exType) => (
              <Pressable
                key={exType}
                onPress={() => setType(exType)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: type === exType ? colors.primary : colors.surface,
                    borderColor: type === exType ? colors.primary : colors.border,
                  },
                ]}
                className="rounded-lg px-3 py-2 border"
              >
                <Text
                  className={`text-sm font-medium ${type === exType ? "text-background" : "text-foreground"}`}
                >
                  {EXERCISE_ICONS[exType]} {EXERCISE_LABELS[exType]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Duration (minutes)</Text>
          <View className="bg-surface rounded-xl border border-border px-4 py-3">
            <TextInput
              placeholder="30"
              placeholderTextColor={colors.muted}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              className="text-foreground text-lg"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Distance (km) - Optional</Text>
          <View className="bg-surface rounded-xl border border-border px-4 py-3">
            <TextInput
              placeholder="5.2"
              placeholderTextColor={colors.muted}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              className="text-foreground text-lg"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Calories - Optional</Text>
          <View className="bg-surface rounded-xl border border-border px-4 py-3">
            <TextInput
              placeholder="250"
              placeholderTextColor={colors.muted}
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              className="text-foreground text-lg"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Date</Text>
          <View className="bg-surface rounded-xl border border-border px-4 py-3">
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              className="text-foreground"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Notes - Optional</Text>
          <TextInput
            placeholder="How did it feel?"
            placeholderTextColor={colors.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            className="bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
          />
        </View>

        <View className="flex-1" />

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-surface border border-border rounded-full py-3 items-center"
          >
            <Text className="text-foreground font-semibold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="flex-1 bg-primary rounded-full py-3 items-center"
            style={{ opacity: saving ? 0.6 : 1 }}
          >
            <Text className="text-background font-semibold">{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
