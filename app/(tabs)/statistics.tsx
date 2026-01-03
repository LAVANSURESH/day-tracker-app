/**
 * Statistics Screen - Mood trends and journaling stats
 */

import { ScrollView, View, Text } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useJournal } from "@/lib/journal-context";
import { MoodType } from "@/shared/types";

const MOOD_EMOJI: Record<MoodType, string> = {
  happy: "😊",
  sad: "😢",
  neutral: "😐",
  anxious: "😰",
  excited: "🤩",
  grateful: "🙏",
};

const MOOD_LABELS: Record<MoodType, string> = {
  happy: "Happy",
  sad: "Sad",
  neutral: "Neutral",
  anxious: "Anxious",
  excited: "Excited",
  grateful: "Grateful",
};

export default function StatisticsScreen() {
  const { state } = useJournal();
  const { stats } = state;

  const getMoodPercentage = (count: number) => {
    if (stats.totalEntries === 0) return 0;
    return Math.round((count / stats.totalEntries) * 100);
  };

  const sortedMoods = Object.entries(stats.moodDistribution)
    .map(([mood, count]) => ({
      mood: mood as MoodType,
      count,
      percentage: getMoodPercentage(count),
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <Text className="text-3xl font-bold text-foreground">Statistics</Text>
          <Text className="text-sm text-muted mt-1">Your journaling insights</Text>
        </View>

        {/* Stats Overview */}
        <View className="px-6 py-6 gap-4">
          {/* Total Entries Card */}
          <View className="bg-surface rounded-lg p-6 border border-border">
            <Text className="text-sm text-muted mb-2">Total Entries</Text>
            <Text className="text-4xl font-bold text-primary">{stats.totalEntries}</Text>
          </View>

          {/* Current Streak Card */}
          <View className="bg-surface rounded-lg p-6 border border-border">
            <Text className="text-sm text-muted mb-2">Current Streak</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-4xl font-bold text-primary">{stats.currentStreak}</Text>
              <Text className="text-base text-muted">
                {stats.currentStreak === 1 ? "day" : "days"}
              </Text>
            </View>
          </View>

          {/* Mood Distribution */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">Mood Distribution</Text>

            {stats.totalEntries === 0 ? (
              <View className="bg-surface rounded-lg p-6 border border-border items-center">
                <Text className="text-muted">No entries yet</Text>
              </View>
            ) : (
              <View className="gap-3">
                {sortedMoods.map((item) => (
                  <View key={item.mood} className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2 flex-1">
                        <Text className="text-2xl">{MOOD_EMOJI[item.mood]}</Text>
                        <Text className="text-sm font-medium text-foreground flex-1">
                          {MOOD_LABELS[item.mood]}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-semibold text-primary">
                          {item.count} {item.count === 1 ? "entry" : "entries"}
                        </Text>
                        <Text className="text-xs text-muted">{item.percentage}%</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-border rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Most Common Mood */}
          {stats.totalEntries > 0 && sortedMoods.length > 0 && (
            <View className="bg-primary/10 rounded-lg p-6 border border-primary">
              <Text className="text-sm text-muted mb-2">Most Common Mood</Text>
              <View className="flex-row items-center gap-3">
                <Text className="text-5xl">{MOOD_EMOJI[sortedMoods[0].mood]}</Text>
                <View>
                  <Text className="text-lg font-bold text-primary">
                    {MOOD_LABELS[sortedMoods[0].mood]}
                  </Text>
                  <Text className="text-sm text-muted">
                    {sortedMoods[0].count} {sortedMoods[0].count === 1 ? "entry" : "entries"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Last Entry */}
          {stats.lastEntryDate && (
            <View className="bg-surface rounded-lg p-6 border border-border">
              <Text className="text-sm text-muted mb-2">Last Entry</Text>
              <Text className="text-base font-semibold text-foreground">
                {new Date(stats.lastEntryDate + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Footer Spacing */}
        <View className="h-6" />
      </ScrollView>
    </ScreenContainer>
  );
}
