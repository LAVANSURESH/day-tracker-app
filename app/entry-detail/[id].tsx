/**
 * Entry Detail Screen
 */

import { ScrollView, View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useJournal } from "@/lib/journal-context";
import { useEffect, useState } from "react";
import { JournalEntry } from "@/shared/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  neutral: "😐",
  anxious: "😰",
  excited: "🤩",
  grateful: "🙏",
};

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, deleteEntry } = useJournal();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      const found = state.entries.find((e) => e.id === id);
      setEntry(found || null);
      setLoading(false);
    }
  }, [id, state.entries]);

  const handleEdit = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/edit-entry/${id}`);
  };

  const handleDelete = () => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: async () => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          setDeleting(true);
          try {
            await deleteEntry(id!);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            router.back();
          } catch (error) {
            Alert.alert("Error", "Failed to delete entry");
            console.error("Error deleting entry:", error);
          } finally {
            setDeleting(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ScreenContainer>
    );
  }

  if (!entry) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground text-lg font-semibold">Entry not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-primary px-6 py-2 rounded-lg">
          <Text className="text-background font-semibold">Go Back</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-6 py-4 border-b border-border flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-3 mb-2">
              <Text className="text-3xl">{MOOD_EMOJI[entry.mood] || "😐"}</Text>
              <View>
                <Text className="text-lg font-bold text-foreground">{formatDate(entry.date)}</Text>
                <Text className="text-xs text-muted">{formatTime(entry.createdAt)}</Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="p-2"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text className="text-2xl">✕</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="px-6 py-6 gap-4 flex-1">
          {/* Title */}
          {entry.title && (
            <View>
              <Text className="text-2xl font-bold text-foreground">{entry.title}</Text>
            </View>
          )}

          {/* Entry Content */}
          <Text className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </Text>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <View className="mt-4 gap-2">
              <Text className="text-sm font-semibold text-muted">Tags</Text>
              <View className="flex-row gap-2 flex-wrap">
                {entry.tags.map((tag, index) => (
                  <View key={index} className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-xs text-primary font-medium">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Metadata */}
          <View className="mt-6 pt-6 border-t border-border">
            <Text className="text-xs text-muted">
              Created: {new Date(entry.createdAt).toLocaleString()}
            </Text>
            {entry.updatedAt !== entry.createdAt && (
              <Text className="text-xs text-muted mt-1">
                Last updated: {new Date(entry.updatedAt).toLocaleString()}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 py-6 gap-3 border-t border-border">
          <Pressable
            onPress={handleEdit}
            disabled={deleting}
            style={({ pressed }) => ({
              transform: [{ scale: pressed && !deleting ? 0.97 : 1 }],
              opacity: deleting ? 0.6 : 1,
            })}
            className="bg-primary rounded-lg p-4 items-center"
          >
            <Text className="text-background font-semibold">Edit Entry</Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            disabled={deleting}
            style={({ pressed }) => ({
              opacity: pressed && !deleting ? 0.7 : deleting ? 0.6 : 1,
            })}
            className="bg-error/10 rounded-lg p-4 items-center border border-error"
          >
            {deleting ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Text className="text-error font-semibold">Delete Entry</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
