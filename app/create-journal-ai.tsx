import { ScrollView, Text, View, TouchableOpacity, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import * as journalStorage from "@/lib/storage";
import * as exerciseStorage from "@/lib/exercise-storage";
import * as habitStorage from "@/lib/habit-storage";
import * as expenseStorage from "@/lib/expense-storage";
import { ExtractionResult } from "@/shared/extraction-types";

export default function CreateJournalAIScreen() {
  const colors = useColors();
  const router = useRouter();
  const [journalText, setJournalText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [extracting, setExtracting] = useState(false);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [saving, setSaving] = useState(false);

  const extractMutation = trpc.extraction.extract.useMutation();

  const handleExtract = async () => {
    if (!journalText.trim()) {
      alert("Please write something in your journal");
      return;
    }

    setExtracting(true);
    try {
      const result = await extractMutation.mutateAsync({
        journalText,
        date,
      });

      if (result.success && result.extraction) {
        setExtraction(result.extraction);
      } else {
        alert("Failed to extract: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Extraction error:", error);
      alert("Error extracting from journal");
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!journalText.trim()) {
      alert("Please write something in your journal");
      return;
    }

    setSaving(true);
    try {
      // Save journal entry
      const entry = await journalStorage.createEntry({
        date,
        content: journalText,
        mood: (extraction?.activities[0]?.mood as any) || undefined,
      })

      // Save extracted items
      if (extraction) {
        // Save exercises
        for (const exercise of extraction.exercises) {
          await exerciseStorage.createExercise({
            date,
            type: exercise.type,
            duration: exercise.duration,
            distance: exercise.distance,
            notes: exercise.notes,
          });
        }

        // Save habits
        for (const habit of extraction.habits) {
          await habitStorage.createHabit({
            name: habit.name,
            frequency: habit.frequency || "daily",
            description: habit.notes,
          });
        }

        // Save expenses
        for (const expense of extraction.expenses) {
          await expenseStorage.createExpense({
            date,
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
          });
        }
      }

      router.back();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save journal entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="text-3xl font-bold text-foreground mb-6">Journal Entry</Text>

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
          <Text className="text-sm font-semibold text-foreground mb-2">What happened today?</Text>
          <TextInput
            placeholder="Write about your day, activities, expenses, habits, workouts..."
            placeholderTextColor={colors.muted}
            value={journalText}
            onChangeText={setJournalText}
            multiline
            numberOfLines={8}
            className="bg-surface rounded-xl border border-border px-4 py-3 text-foreground"
            textAlignVertical="top"
          />
          <Text className="text-xs text-muted mt-2">{journalText.length} characters</Text>
        </View>

        {extraction && (
          <View className="mb-6 bg-success/10 rounded-xl border border-success p-4">
            <Text className="text-sm font-semibold text-foreground mb-3">✓ Extracted Items</Text>

            {extraction.exercises.length > 0 && (
              <View className="mb-3">
                <Text className="text-xs font-semibold text-muted mb-1">Exercises ({extraction.exercises.length})</Text>
                {extraction.exercises.map((ex, i) => (
                  <Text key={i} className="text-xs text-foreground">
                    • {ex.type} - {ex.duration}min {ex.distance ? `(${ex.distance}km)` : ""}
                  </Text>
                ))}
              </View>
            )}

            {extraction.habits.length > 0 && (
              <View className="mb-3">
                <Text className="text-xs font-semibold text-muted mb-1">Habits ({extraction.habits.length})</Text>
                {extraction.habits.map((h, i) => (
                  <Text key={i} className="text-xs text-foreground">
                    • {h.name} {h.completed ? "✓" : "○"}
                  </Text>
                ))}
              </View>
            )}

            {extraction.expenses.length > 0 && (
              <View className="mb-3">
                <Text className="text-xs font-semibold text-muted mb-1">Expenses ({extraction.expenses.length})</Text>
                {extraction.expenses.map((ex, i) => (
                  <Text key={i} className="text-xs text-foreground">
                    • {ex.category} - ${ex.amount.toFixed(2)}
                  </Text>
                ))}
              </View>
            )}

            {extraction.activities.length > 0 && (
              <View>
                <Text className="text-xs font-semibold text-muted mb-1">Activities ({extraction.activities.length})</Text>
                {extraction.activities.map((a, i) => (
                  <Text key={i} className="text-xs text-foreground">
                    • {a.title}
                  </Text>
                ))}
              </View>
            )}

            <Text className="text-xs text-muted mt-3">
              Processing time: {extraction.processingTimeMs}ms
            </Text>
          </View>
        )}

        <View className="flex-1" />

        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-surface border border-border rounded-full py-3 items-center"
          >
            <Text className="text-foreground font-semibold">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExtract}
            disabled={extracting || !journalText.trim()}
            className="flex-1 bg-primary rounded-full py-3 items-center"
            style={{ opacity: extracting || !journalText.trim() ? 0.6 : 1 }}
          >
            {extracting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-semibold">✨ Extract</Text>
            )}
          </TouchableOpacity>
        </View>

        {extraction && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="w-full bg-success rounded-full py-3 items-center"
            style={{ opacity: saving ? 0.6 : 1 }}
          >
            {saving ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-semibold">Save Entry & Track Items</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
