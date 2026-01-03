/**
 * Mood Selector Component
 * Displays mood options as emoji buttons
 */

import { View, Pressable, Text } from "react-native";
import { MoodType } from "@/shared/types";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const MOOD_OPTIONS: Array<{ type: MoodType; emoji: string; label: string }> = [
  { type: "happy", emoji: "😊", label: "Happy" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "neutral", emoji: "😐", label: "Neutral" },
  { type: "anxious", emoji: "😰", label: "Anxious" },
  { type: "excited", emoji: "🤩", label: "Excited" },
  { type: "grateful", emoji: "🙏", label: "Grateful" },
];

interface MoodSelectorProps {
  value?: MoodType;
  onChange: (mood: MoodType) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const handleMoodPress = (mood: MoodType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(mood);
  };

  return (
    <View className="gap-4">
      <Text className="text-sm font-semibold text-foreground">How are you feeling?</Text>
      <View className="flex-row flex-wrap gap-3 justify-between">
        {MOOD_OPTIONS.map((mood) => (
          <Pressable
            key={mood.type}
            onPress={() => handleMoodPress(mood.type)}
            className={cn(
              "flex-1 min-w-[48%] items-center justify-center py-4 rounded-xl border-2 transition-all",
              value === mood.type
                ? "bg-primary border-primary"
                : "bg-surface border-border"
            )}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text className="text-4xl mb-1">{mood.emoji}</Text>
            <Text
              className={cn(
                "text-xs font-medium",
                value === mood.type ? "text-background" : "text-foreground"
              )}
            >
              {mood.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
