import { ScrollView, Text, View, TouchableOpacity, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as expenseStorage from "@/lib/expense-storage";
import { ExpenseCategory } from "@/shared/types";
import { useRouter } from "expo-router";

const CATEGORIES: ExpenseCategory[] = ["food", "transport", "entertainment", "utilities", "health", "shopping", "other"];

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  food: "🍔",
  transport: "🚗",
  entertainment: "🎬",
  utilities: "💡",
  health: "🏥",
  shopping: "🛍️",
  other: "📦",
};

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: "Food",
  transport: "Transport",
  entertainment: "Entertainment",
  utilities: "Utilities",
  health: "Health",
  shopping: "Shopping",
  other: "Other",
};

export default function CreateExpenseScreen() {
  const colors = useColors();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      alert("Please enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      await expenseStorage.createExpense({
        date,
        category,
        amount: parseFloat(amount),
        description: description || undefined,
      });
      router.back();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="text-3xl font-bold text-foreground mb-6">Add Expense</Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Amount</Text>
          <View className="flex-row items-center bg-surface rounded-xl border border-border px-4 py-3">
            <Text className="text-2xl mr-2">$</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              className="flex-1 text-lg text-foreground"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: category === cat ? colors.primary : colors.surface,
                    borderColor: category === cat ? colors.primary : colors.border,
                  },
                ]}
                className="rounded-full px-4 py-2 border"
              >
                <Text
                  className={`text-sm font-medium ${category === cat ? "text-background" : "text-foreground"}`}
                >
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </Text>
              </Pressable>
            ))}
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
          <Text className="text-sm font-semibold text-foreground mb-2">Description (Optional)</Text>
          <TextInput
            placeholder="What did you spend on?"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
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
