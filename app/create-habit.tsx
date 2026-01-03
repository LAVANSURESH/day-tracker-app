import { ScrollView, Text, View, TouchableOpacity, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as habitStorage from "@/lib/habit-storage";
import { HabitFrequency } from "@/shared/types";
import { useRouter } from "expo-router";

const FREQUENCIES: HabitFrequency[] = ["daily", "weekly", "monthly"];

const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export default function CreateHabitScreen() {
  const colors = useColors();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a habit name");
      return;
    }

    setSaving(true);
    try {
      await habitStorage.createHabit({
        name,
        description: description || undefined,
        frequency,
      });
      router.back();
    } catch (error) {
      console.error("Error saving habit:", error);
      alert("Failed to save habit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="text-3xl font-bold text-foreground mb-6">Create Habit</Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Habit Name</Text>
          <TextInput
            placeholder="e.g., Morning Meditation"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            className="bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Description (Optional)</Text>
          <TextInput
            placeholder="Why is this habit important?"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            className="bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Frequency</Text>
          <View className="flex-row gap-2">
            {FREQUENCIES.map((freq) => (
              <Pressable
                key={freq}
                onPress={() => setFrequency(freq)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: frequency === freq ? colors.primary : colors.surface,
                    borderColor: frequency === freq ? colors.primary : colors.border,
                  },
                ]}
                className="flex-1 rounded-lg px-4 py-3 border items-center"
              >
                <Text
                  className={`font-medium ${frequency === freq ? "text-background" : "text-foreground"}`}
                >
                  {FREQUENCY_LABELS[freq]}
                </Text>
              </Pressable>
            ))}
          </View>
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
            <Text className="text-background font-semibold">{saving ? "Saving..." : "Create"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
