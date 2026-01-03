import { ScrollView, Text, View, TouchableOpacity, FlatList, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as expenseStorage from "@/lib/expense-storage";
import { ExpenseEntry, ExpenseStats, ExpenseCategory } from "@/shared/types";
import { Link } from "expo-router";

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

export default function ExpensesScreen() {
  const colors = useColors();
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const allExpenses = await expenseStorage.getAllExpenses();
      const expenseStats = await expenseStorage.calculateExpenseStats();
      setExpenses(allExpenses);
      setStats(expenseStats);
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseStorage.deleteExpense(id);
      await loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <ScreenContainer className="p-4">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-foreground mb-2">Expenses</Text>
        {stats && (
          <Text className="text-base text-muted">
            Total: {formatCurrency(stats.totalAmount)} • {stats.totalExpenses} entries
          </Text>
        )}
      </View>

      {stats && (
        <View className="mb-6 bg-surface rounded-2xl p-4 border border-border">
          <View className="flex-row justify-between mb-4">
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">Total Spending</Text>
              <Text className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalAmount)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">Average/Day</Text>
              <Text className="text-2xl font-bold text-foreground">{formatCurrency(stats.averagePerDay)}</Text>
            </View>
          </View>

          <View className="border-t border-border pt-4">
            <Text className="text-sm font-semibold text-foreground mb-3">By Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                count > 0 && (
                  <View key={category} className="bg-background rounded-full px-3 py-1">
                    <Text className="text-xs text-foreground">
                      {CATEGORY_ICONS[category as ExpenseCategory]} {count}
                    </Text>
                  </View>
                )
              ))}
            </View>
          </View>
        </View>
      )}

      {expenses.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-5xl mb-4">💰</Text>
          <Text className="text-lg font-semibold text-foreground mb-2">No expenses yet</Text>
          <Text className="text-sm text-muted text-center mb-6">Track your spending to see insights</Text>
          <Link href="/create-expense" asChild>
            <TouchableOpacity className="bg-primary px-6 py-3 rounded-full">
              <Text className="text-background font-semibold">Add Expense</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View className="mb-3 bg-surface rounded-xl p-4 border border-border flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-2">{CATEGORY_ICONS[item.category]}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{CATEGORY_LABELS[item.category]}</Text>
                    <Text className="text-xs text-muted">{formatDate(item.date)}</Text>
                  </View>
                </View>
                {item.description && <Text className="text-sm text-muted">{item.description}</Text>}
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-foreground">{formatCurrency(item.amount)}</Text>
                <Pressable
                  onPress={() => handleDeleteExpense(item.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text className="text-xs text-error mt-2">Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <Link href="/create-expense" asChild>
        <TouchableOpacity className="mt-6 bg-primary py-3 rounded-full items-center">
          <Text className="text-background font-semibold">+ Add Expense</Text>
        </TouchableOpacity>
      </Link>
    </ScreenContainer>
  );
}
