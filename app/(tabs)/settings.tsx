/**
 * Settings Screen - App preferences and configuration
 */

import { ScrollView, View, Text, Pressable, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const THEME_KEY = "day_tracker_theme";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = useColors();
  const [darkMode, setDarkMode] = useState(colorScheme === "dark");
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const loadPreferences = async () => {
      try {
        const saved = await AsyncStorage.getItem("day_tracker_notifications");
        if (saved !== null) {
          setNotifications(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };
    loadPreferences();
  }, []);

  const handleThemeToggle = async (value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDarkMode(value);
    // Note: Actual theme switching is handled by ThemeProvider
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setNotifications(value);
    try {
      await AsyncStorage.setItem("day_tracker_notifications", JSON.stringify(value));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Export functionality coming soon!");
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all journal entries? This cannot be undone.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("day_tracker_entries");
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert("Success", "All data has been cleared.");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <Text className="text-3xl font-bold text-foreground">Settings</Text>
          <Text className="text-sm text-muted mt-1">Customize your experience</Text>
        </View>

        {/* Settings Sections */}
        <View className="px-6 py-6 gap-6">
          {/* Appearance Section */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">Appearance</Text>
            <View className="bg-surface rounded-lg border border-border overflow-hidden">
              <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Dark Mode</Text>
                  <Text className="text-xs text-muted mt-1">Use dark theme</Text>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: "#E5E7EB", true: "#0a7ea4" }}
                />
              </View>
            </View>
          </View>

          {/* Notifications Section */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">Notifications</Text>
            <View className="bg-surface rounded-lg border border-border overflow-hidden">
              <View className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Daily Reminders</Text>
                  <Text className="text-xs text-muted mt-1">Get reminded to journal daily</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: "#E5E7EB", true: "#0a7ea4" }}
                />
              </View>
            </View>
          </View>

          {/* Data Section */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">Data</Text>
            <View className="bg-surface rounded-lg border border-border overflow-hidden">
              <Pressable
                onPress={handleExportData}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="flex-row items-center justify-between px-4 py-4 border-b border-border"
              >
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Export Data</Text>
                  <Text className="text-xs text-muted mt-1">Download your journal entries</Text>
                </View>
                <Text className="text-lg text-muted">›</Text>
              </Pressable>

              <Pressable
                onPress={handleClearData}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="flex-row items-center justify-between px-4 py-4"
              >
                <View className="flex-1">
                  <Text className="text-base font-semibold text-error">Clear All Data</Text>
                  <Text className="text-xs text-muted mt-1">Delete all journal entries</Text>
                </View>
                <Text className="text-lg text-error">›</Text>
              </Pressable>
            </View>
          </View>

          {/* About Section */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">About</Text>
            <View className="bg-surface rounded-lg border border-border px-4 py-4">
              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">App Version</Text>
                  <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Built with</Text>
                  <Text className="text-sm font-semibold text-foreground">React Native</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Spacing */}
        <View className="h-6" />
      </ScrollView>
    </ScreenContainer>
  );
}
