/**
 * AI-powered extraction service for journal entries
 * Uses LLM to automatically extract exercises, habits, expenses, and activities
 */

import { invokeLLM } from "./_core/llm";
import {
  ExtractionRequest,
  ExtractionResult,
  ExtractedExercise,
  ExtractedHabit,
  ExtractedExpense,
  ExtractedActivity,
} from "../shared/extraction-types";

const EXTRACTION_SCHEMA = {
  type: "json_object",
  json_schema: {
    name: "journal_extraction",
    strict: true,
    schema: {
      type: "object",
      properties: {
        exercises: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["running", "cycling", "gym", "yoga", "swimming", "sports", "walking", "other"],
              },
              duration: { type: "integer", description: "Duration in minutes" },
              distance: { type: "number", description: "Distance in km (optional)" },
              intensity: { type: "string", enum: ["light", "moderate", "high"] },
              notes: { type: "string" },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["type", "duration", "confidence"],
            additionalProperties: false,
          },
        },
        habits: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the habit" },
              completed: { type: "boolean" },
              frequency: { type: "string", enum: ["daily", "weekly", "monthly"] },
              notes: { type: "string" },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["name", "completed", "confidence"],
            additionalProperties: false,
          },
        },
        expenses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["food", "transport", "entertainment", "utilities", "health", "shopping", "other"],
              },
              amount: { type: "number", description: "Amount in currency" },
              description: { type: "string" },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["category", "amount", "confidence"],
            additionalProperties: false,
          },
        },
        activities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["activity", "event", "milestone"] },
              title: { type: "string" },
              mood: { type: "string", enum: ["happy", "sad", "neutral", "anxious", "excited", "grateful"] },
              tags: { type: "array", items: { type: "string" } },
              notes: { type: "string" },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["type", "title", "confidence"],
            additionalProperties: false,
          },
        },
      },
      required: ["exercises", "habits", "expenses", "activities"],
      additionalProperties: false,
    },
  },
};

export async function extractFromJournal(request: ExtractionRequest): Promise<ExtractionResult> {
  const startTime = Date.now();

  const systemPrompt = `You are an expert at analyzing journal entries and extracting structured data about activities, habits, expenses, and exercises.

When analyzing a journal entry, extract:
1. **Exercises**: Any physical activities mentioned (running, cycling, gym, yoga, swimming, sports, walking, etc.). Include duration in minutes and any distance if mentioned.
2. **Habits**: Any habits that were completed or attempted (meditation, reading, journaling, studying, etc.).
3. **Expenses**: Any money spent or purchases mentioned (food, transport, entertainment, utilities, health, shopping, etc.).
4. **Activities**: Important events, milestones, or activities that happened during the day.

For each extracted item, assign a confidence score (0-1) based on how clearly it was mentioned in the text:
- 1.0: Explicitly and clearly stated
- 0.8-0.9: Clearly implied or mentioned with specific details
- 0.6-0.7: Somewhat implied or mentioned vaguely
- 0.4-0.5: Weakly implied or uncertain
- Below 0.4: Very uncertain (don't include)

Return ONLY valid JSON matching the schema. Do not include any explanations or markdown.`;

  const userPrompt = `Analyze this journal entry from ${request.date} and extract all activities, habits, expenses, and exercises mentioned:

${request.journalText}

${request.mood ? `Overall mood mentioned: ${request.mood}` : ""}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: EXTRACTION_SCHEMA as any,
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No content in LLM response");
    }

    const parsed = JSON.parse(content);

    // Filter out low-confidence items (below 0.4)
    const result: ExtractionResult = {
      journalEntryId: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      extractedAt: Date.now(),
      exercises: (parsed.exercises || []).filter((e: ExtractedExercise) => e.confidence >= 0.4),
      habits: (parsed.habits || []).filter((h: ExtractedHabit) => h.confidence >= 0.4),
      expenses: (parsed.expenses || []).filter((e: ExtractedExpense) => e.confidence >= 0.4),
      activities: (parsed.activities || []).filter((a: ExtractedActivity) => a.confidence >= 0.4),
      rawText: request.journalText,
      extractionModel: "gpt-4o",
      processingTimeMs: Date.now() - startTime,
    };

    return result;
  } catch (error) {
    console.error("Extraction error:", error);
    throw new Error(`Failed to extract from journal: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Extract mood from journal text using LLM
 */
export async function extractMoodFromJournal(journalText: string): Promise<string | null> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing emotions in text. Read the journal entry and identify the primary mood in one word. Return ONLY one of these moods: happy, sad, neutral, anxious, excited, grateful. Return just the mood word, nothing else.`,
        },
        { role: "user", content: journalText },
      ],
    });

    const moodContent = response.choices[0].message.content;
    const mood = typeof moodContent === "string" ? moodContent.trim().toLowerCase() : null;
    const validMoods = ["happy", "sad", "neutral", "anxious", "excited", "grateful"];

    return mood && validMoods.includes(mood) ? mood : null;
  } catch (error) {
    console.error("Mood extraction error:", error);
    return null;
  }
}
