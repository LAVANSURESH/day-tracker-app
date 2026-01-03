/**
 * Home Screen - Journal Entry List
 */

import { FlatList, View, Pressable, Text, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter, Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useJournal } from "@/lib/journal-context";
import { EntryCard } from "@/components/entry-card";
import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { state, loadEntries } = useJournal();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }, [loadEntries]);

  const handleNewEntry = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/create-entry");
  };

  const handleAIJournal = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/create-journal-ai");
  };

  const handleEntryPress = (entryId: string) => {
    router.push(`/entry-detail/${entryId}`);
  };

  const sortedEntries = [...state.entries].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt - a.createdAt;
  });

  return (
    <ScreenContainer className="flex-1">
      <View className="flex-1 flex-col">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <Text className="text-3xl font-bold text-foreground">Journal</Text>
          <Text className="text-sm text-muted mt-1">
            {state.stats.totalEntries} {state.stats.totalEntries === 1 ? "entry" : "entries"}
          </Text>
        </View>

        {/* Entry List or Empty State */}
        {state.loading && !refreshing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0a7ea4" />
          </View>
        ) : sortedEntries.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-5xl mb-4">📝</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">No entries yet</Text>
            <Text className="text-sm text-muted text-center mb-6">
              Start your journaling journey by creating your first entry.
            </Text>
            <Pressable
              onPress={handleNewEntry}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
              className="bg-primary px-6 py-3 rounded-full"
            >
              <Text className="text-background font-semibold">Create Entry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={sortedEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EntryCard entry={item} onPress={() => handleEntryPress(item.id)} />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#0a7ea4"
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <Text className="text-muted">No entries found</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Buttons */}
      <View className="absolute bottom-6 right-6 gap-3">
        <Pressable
          onPress={handleAIJournal}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
          className="bg-primary rounded-full p-4 shadow-lg items-center justify-center"
        >
          <Text className="text-xl">✨</Text>
        </Pressable>
        <Pressable
          onPress={handleNewEntry}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
          className="bg-primary rounded-full p-4 shadow-lg"
        >
          <Text className="text-2xl text-background font-bold">+</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
