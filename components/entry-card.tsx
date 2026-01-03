/**
 * Entry Card Component
 * Displays a single journal entry in list view
 */

import { View, Pressable, Text } from "react-native";
import { JournalEntry } from "@/shared/types";
import { cn } from "@/lib/utils";
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

interface EntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
}

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const preview = entry.content.substring(0, 60).replace(/\n/g, " ");
  const hasMore = entry.content.length > 60;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
      className="mb-3"
    >
      <View className="bg-surface rounded-lg p-4 border border-border">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-row items-center gap-2 flex-1">
            <Text className="text-2xl">{MOOD_EMOJI[entry.mood] || "😐"}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">
                {formatDate(entry.date)}
              </Text>
              <Text className="text-xs text-muted">{formatTime(entry.createdAt)}</Text>
            </View>
          </View>
        </View>

        {entry.title && (
          <Text className="text-base font-semibold text-foreground mb-1">
            {entry.title}
          </Text>
        )}

        <Text className="text-sm text-muted leading-relaxed">
          {preview}
          {hasMore && "..."}
        </Text>

        {entry.tags && entry.tags.length > 0 && (
          <View className="flex-row gap-2 mt-3 flex-wrap">
            {entry.tags.slice(0, 2).map((tag, index) => (
              <View key={index} className="bg-primary/10 px-2 py-1 rounded-full">
                <Text className="text-xs text-primary font-medium">{tag}</Text>
              </View>
            ))}
            {entry.tags.length > 2 && (
              <Text className="text-xs text-muted self-center">
                +{entry.tags.length - 2} more
              </Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}
