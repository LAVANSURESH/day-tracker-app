/**
 * Create Entry Screen
 */

import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { MoodSelector } from "@/components/mood-selector";
import { useJournal } from "@/lib/journal-context";
import { MoodType } from "@/shared/types";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function CreateEntryScreen() {
  const router = useRouter();
  const { createEntry } = useJournal();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mood, setMood] = useState<MoodType>("happy");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please write something in your entry");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setLoading(true);
    try {
      await createEntry({
        date,
        mood,
        title: title.trim() || undefined,
        content: content.trim(),
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save entry. Please try again.");
      console.error("Error creating entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">New Entry</Text>
          <Text className="text-sm text-muted mt-1">{formatDateDisplay(date)}</Text>
        </View>

        {/* Content */}
        <View className="px-6 py-6 gap-6 flex-1">
          {/* Date Display */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Date</Text>
            <Pressable className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-base text-foreground">{formatDateDisplay(date)}</Text>
            </Pressable>
          </View>

          {/* Mood Selector */}
          <MoodSelector value={mood} onChange={setMood} />

          {/* Title Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Title (Optional)</Text>
            <TextInput
              placeholder="Give your entry a title..."
              placeholderTextColor="#8A92A0"
              value={title}
              onChangeText={setTitle}
              className="bg-surface rounded-lg p-4 text-foreground border border-border"
              maxLength={100}
            />
          </View>

          {/* Content Input */}
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground mb-2">What's on your mind?</Text>
            <TextInput
              placeholder="Write your thoughts, feelings, and experiences here..."
              placeholderTextColor="#8A92A0"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              className="bg-surface rounded-lg p-4 text-foreground border border-border flex-1"
            />
            <Text className="text-xs text-muted mt-2 text-right">
              {content.length} characters
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 pb-6">
            <Pressable
              onPress={handleSave}
              disabled={loading}
              style={({ pressed }) => ({
                transform: [{ scale: pressed && !loading ? 0.97 : 1 }],
                opacity: loading ? 0.6 : 1,
              })}
              className="bg-primary rounded-lg p-4 items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-background font-semibold text-base">Save Entry</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleCancel}
              disabled={loading}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              className="bg-surface rounded-lg p-4 items-center justify-center border border-border"
            >
              <Text className="text-foreground font-semibold text-base">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
