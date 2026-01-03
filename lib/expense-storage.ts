/**
 * AsyncStorage service for expense entries
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExpenseEntry, CreateExpenseInput, UpdateExpenseInput, ExpenseStats, ExpenseCategory } from "@/shared/types";

const EXPENSES_KEY = "day_tracker_expenses";

export async function getAllExpenses(): Promise<ExpenseEntry[]> {
  try {
    const data = await AsyncStorage.getItem(EXPENSES_KEY);
    if (!data) return [];
    return JSON.parse(data) as ExpenseEntry[];
  } catch (error) {
    console.error("Error reading expenses:", error);
    return [];
  }
}

export async function getExpenseById(id: string): Promise<ExpenseEntry | null> {
  try {
    const expenses = await getAllExpenses();
    return expenses.find((e) => e.id === id) || null;
  } catch (error) {
    console.error("Error reading expense:", error);
    return null;
  }
}

export async function getExpensesByDate(date: string): Promise<ExpenseEntry[]> {
  try {
    const expenses = await getAllExpenses();
    return expenses.filter((e) => e.date === date);
  } catch (error) {
    console.error("Error reading expenses by date:", error);
    return [];
  }
}

export async function getExpensesByCategory(category: ExpenseCategory): Promise<ExpenseEntry[]> {
  try {
    const expenses = await getAllExpenses();
    return expenses.filter((e) => e.category === category);
  } catch (error) {
    console.error("Error reading expenses by category:", error);
    return [];
  }
}

export async function createExpense(input: CreateExpenseInput): Promise<ExpenseEntry> {
  try {
    const expenses = await getAllExpenses();
    const newExpense: ExpenseEntry = {
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expenses.unshift(newExpense);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    return newExpense;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
}

export async function updateExpense(id: string, updates: UpdateExpenseInput): Promise<ExpenseEntry | null> {
  try {
    const expenses = await getAllExpenses();
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) return null;

    const updatedExpense: ExpenseEntry = {
      ...expenses[index],
      ...updates,
      id: expenses[index].id,
      createdAt: expenses[index].createdAt,
      updatedAt: Date.now(),
    };

    expenses[index] = updatedExpense;
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    return updatedExpense;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
}

export async function deleteExpense(id: string): Promise<boolean> {
  try {
    const expenses = await getAllExpenses();
    const filtered = expenses.filter((e) => e.id !== id);

    if (filtered.length === expenses.length) return false;

    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
}

export async function calculateExpenseStats(): Promise<ExpenseStats> {
  try {
    const expenses = await getAllExpenses();

    if (expenses.length === 0) {
      return {
        totalExpenses: 0,
        totalAmount: 0,
        categoryBreakdown: {
          food: 0,
          transport: 0,
          entertainment: 0,
          utilities: 0,
          health: 0,
          shopping: 0,
          other: 0,
        },
        averagePerDay: 0,
      };
    }

    const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const categoryBreakdown: Record<ExpenseCategory, number> = {
      food: 0,
      transport: 0,
      entertainment: 0,
      utilities: 0,
      health: 0,
      shopping: 0,
      other: 0,
    };

    let totalAmount = 0;
    expenses.forEach((expense) => {
      categoryBreakdown[expense.category]++;
      totalAmount += expense.amount;
    });

    // Calculate average per day
    const uniqueDates = new Set(expenses.map((e) => e.date));
    const averagePerDay = totalAmount / uniqueDates.size;

    return {
      totalExpenses: expenses.length,
      totalAmount,
      categoryBreakdown,
      averagePerDay,
      lastExpenseDate: sorted[0]?.date,
    };
  } catch (error) {
    console.error("Error calculating expense stats:", error);
    return {
      totalExpenses: 0,
      totalAmount: 0,
      categoryBreakdown: {
        food: 0,
        transport: 0,
        entertainment: 0,
        utilities: 0,
        health: 0,
        shopping: 0,
        other: 0,
      },
      averagePerDay: 0,
    };
  }
}

export async function clearAllExpenses(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EXPENSES_KEY);
  } catch (error) {
    console.error("Error clearing expenses:", error);
    throw error;
  }
}
