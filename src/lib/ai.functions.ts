import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  chatWithAI,
  extractVoiceLogData,
  generateHealthInsights,
  extractJson,
  type AIMessage,
} from "@/lib/ai.server";
import { supabase } from "@/integrations/supabase/client";
import { 
  transcribeAudio as unifiedTranscribe,
  type TranscriptionLanguage 
} from "@/lib/transcription.server";
import {
  translateText,
  getCachedOrGenerateTTS,
  type AppLangCode,
} from "@/lib/khaya.server";

const LANGUAGE_NAMES = { 
  en: "English", 
  tw: "Twi (Akan)", 
  ak: "Akuapem Twi",
  fat: "Fante",
  dag: "Dagbani",
  dga: "Dagaare",
  gur: "Gurene",
  kus: "Kusaal",
  ksm: "Kasem",
  ee: "Ewe",
  ga: "Ga",
  gon: "Gonja",
  kpo: "Ikposo",
  nic: "Nzema",
} as const;
type LangCode = keyof typeof LANGUAGE_NAMES;

/**
 * Health Coach Chat Function
 * Handles conversational AI with health context and multi-language support
 */
export const askHealthCoach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        message: z.string().min(1).max(4000),
        language: z.enum(["en", "tw", "ak", "fat", "dag", "dga", "gur", "kus", "ksm", "ee", "ga", "gon", "kpo", "nic"]).default("en"),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .max(20)
          .default([]),
        userId: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const language = data.language as LangCode;
    const localised = language !== "en";
    const userId = data.userId || context.user?.id;

    // Fetch recent health context for the user
    let healthContext;
    if (userId) {
      try {
        const [symptoms, mood, voiceLogs] = await Promise.all([
          supabase
            .from("symptoms")
            .select("name, severity, body_area, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("mood_entries")
            .select("mood, mood_score, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("voice_logs")
            .select("transcription, ai_response, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        healthContext = {
          symptoms: symptoms.data || [],
          mood: mood.data || [],
          recentLogs: voiceLogs.data || [],
        };
      } catch (error) {
        console.error("Error fetching health context:", error);
        healthContext = undefined;
      }
    }

    // Convert history to AIMessage format
    const conversationHistory: AIMessage[] = data.history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: m.content,
    }));

    // For non-English languages, translate user message to English first
    // (Gemini reasons best in English for health accuracy)
    let messageForAI = data.message;
    if (localised) {
      try {
        messageForAI = await translateText(
          data.message,
          language as AppLangCode,
          "toEnglish"
        );
        console.log(`[Chat] Translated ${language} → en for AI reasoning`);
      } catch (error) {
        console.error("[Chat] Translation to English failed:", error);
        // Continue with original message if translation fails
      }
    }

    const raw = await chatWithAI(messageForAI, conversationHistory, healthContext);

    if (!localised) {
      const reply = raw || "I'm not sure how to answer that right now.";
      return { reply, audioText: reply, spokenLanguage: "en" as const };
    }

    // For non-English, translate response back to user's language
    try {
      const translatedReply = await translateText(raw, language as AppLangCode, "toLocal");
      console.log(`[Chat] Translated en → ${language} for user`);
      
      return {
        reply: translatedReply,
        audioText: raw, // Keep English for TTS (will be handled separately)
        spokenLanguage: language,
        translated: true, // Flag to show "translated" tag in UI
      };
    } catch (error) {
      console.error(`[Chat] Translation to ${language} failed:`, error);
      // Fallback to English if translation fails
      return {
        reply: raw,
        audioText: raw,
        spokenLanguage: "en" as const,
        translationFailed: true,
      };
    }
  });

/**
 * Voice Note Analysis Function
 * Supports both direct audio processing and pre-transcribed text
 * 
 * For audio: Includes placeholder for future Whisper/ASR integration
 * For transcription: Directly extracts structured data using Gemini
 */
export const analyzeVoiceNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        // Accept either audio data (legacy) or transcription (new)
        audioBase64: z.string().optional(),
        format: z.enum(["webm", "m4a", "mp4", "wav", "mp3", "ogg"]).optional(),
        transcription: z.string().optional(),
        language: z.enum(["en", "tw", "ak", "fat", "dag", "dga", "gur", "kus", "ksm", "ee", "ga", "gon", "kpo", "nic"]).default("en"),
      })
      .refine(
        (data) => data.audioBase64 || data.transcription,
        "Either audioBase64 or transcription must be provided"
      )
      .parse(data),
  )
  .handler(async ({ data }) => {
    let transcription: string;

    // If audio provided, we need to transcribe it first
    if (data.audioBase64 && !data.transcription) {
      try {
        const result = await unifiedTranscribe(
          data.audioBase64,
          data.language as TranscriptionLanguage,
          data.format || "webm"
        );
        
        transcription = result.text;
        console.log(`[Voice] Transcribed with ${result.provider}: verified=${result.verified}`);
      } catch (error) {
        console.error("[Voice] Transcription failed:", error);
        throw new Error(`Transcription failed: ${(error as Error).message}`);
      }
    } else if (data.transcription) {
      transcription = data.transcription;
    } else {
      throw new Error("No transcription available");
    }

    // Extract structured data from transcript using Gemini
    const extracted = await extractVoiceLogData(transcription);

    // Generate a supportive AI response based on extracted data
    const responsePrompt = `The user shared this health check-in: "${transcription}"

Extracted data shows:
- Symptoms: ${extracted.symptoms.length > 0 ? extracted.symptoms.map(s => s.name).join(", ") : "none mentioned"}
- Mood: ${extracted.mood?.description || "not specified"}
- Concerns: ${extracted.concerns.length > 0 ? extracted.concerns.join(", ") : "none"}

Provide a warm, empathetic 2-3 sentence response acknowledging what they shared and offering gentle wellness support.`;

    const aiResponse = await chatWithAI(responsePrompt, []);

    // Format extracted data for database storage
    const extractedForDB: Record<string, string | number | boolean | null> = {
      symptoms: JSON.stringify(extracted.symptoms),
      mood: extracted.mood?.description || null,
      mood_score: extracted.mood?.score || null,
      concerns: JSON.stringify(extracted.concerns),
      triggers: JSON.stringify(extracted.triggers),
      key_phrases: JSON.stringify(extracted.key_phrases),
    };

    return {
      transcription,
      aiResponse: aiResponse || "Thank you for sharing. I'm here to support your wellness journey.",
      extracted: extractedForDB,
      structuredData: extracted, // Also return the structured format for client use
    };
  });

/**
 * Health Insights Generation Function
 * Analyzes aggregated health data and provides actionable insights
 */
export const generateInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        userId: z.string(),
        timeWindow: z.enum(["day", "week", "month"]).default("week"),
        language: z.enum(["en", "tw", "ak", "fat", "dag", "dga", "gur", "kus", "ksm", "ee", "ga", "gon", "kpo", "nic"]).default("en"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const language = data.language as LangCode;
    const localised = language !== "en";

    // Fetch user's health data for the specified time window
    const timeAgo = new Date();
    switch (data.timeWindow) {
      case "day":
        timeAgo.setDate(timeAgo.getDate() - 1);
        break;
      case "week":
        timeAgo.setDate(timeAgo.getDate() - 7);
        break;
      case "month":
        timeAgo.setMonth(timeAgo.getMonth() - 1);
        break;
    }

    try {
      const [symptoms, mood, nutrition, voiceLogs] = await Promise.all([
        supabase
          .from("symptoms")
          .select("*")
          .eq("user_id", data.userId)
          .gte("created_at", timeAgo.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("mood_entries")
          .select("*")
          .eq("user_id", data.userId)
          .gte("created_at", timeAgo.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("nutrition_entries")
          .select("*")
          .eq("user_id", data.userId)
          .gte("created_at", timeAgo.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("voice_logs")
          .select("transcription, ai_response, created_at")
          .eq("user_id", data.userId)
          .gte("created_at", timeAgo.toISOString())
          .order("created_at", { ascending: false }),
      ]);

      const insights = await generateHealthInsights({
        symptoms: symptoms.data || [],
        mood: mood.data || [],
        nutrition: nutrition.data || [],
        voiceLogs: voiceLogs.data || [],
        userId: data.userId,
        timeWindow: data.timeWindow,
      });

      // If non-English language requested, translate insights
      if (localised && insights.length > 0) {
        const translationPrompt = `Translate these health insights to ${LANGUAGE_NAMES[language]}. Maintain the same tone and meaning.

Original insights:
${JSON.stringify(insights, null, 2)}

Respond ONLY with JSON in this format:
{
  "insights": [
    {
      "title": "translated title in ${LANGUAGE_NAMES[language]}",
      "content": "translated content in ${LANGUAGE_NAMES[language]}",
      "category": "same as original",
      "priority": "same as original",
      "spoken": "content in simple spoken English for audio"
    }
  ]
}`;

        const translatedRaw = await chatWithAI(translationPrompt, []);
        const translated = extractJson<{
          insights?: Array<{
            title: string;
            content: string;
            category: string;
            priority: string;
            spoken: string;
          }>;
        }>(translatedRaw, { insights: insights.map(i => ({ ...i, spoken: i.content })) });

        return { 
          insights: translated.insights || insights.map(i => ({
            ...i,
            spoken: i.content,
          })),
        };
      }

      // For English, add spoken field
      return {
        insights: insights.map(i => ({
          ...i,
          severity: i.priority, // Map priority to severity for backwards compatibility
          spoken: i.content,
        })),
      };
    } catch (error) {
      console.error("Error generating insights:", error);
      return { insights: [] };
    }
  });

/**
 * Store chat message in database for conversation history
 */
export const saveChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        userId: z.string(),
        message: z.string(),
        role: z.enum(["user", "assistant"]),
        language: z.enum(["en", "tw", "ak", "fat", "dag", "dga", "gur", "kus", "ksm", "ee", "ga", "gon", "kpo", "nic"]).default("en"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: data.userId,
        content: data.message, // Use 'content' to match database schema
        role: data.role,
        language: data.language as LangCode,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving chat message:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error saving chat message:", error);
      return { success: false, error: "Failed to save message" };
    }
  });

/**
 * Load chat history from database
 */
export const loadChatHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        userId: z.string(),
        limit: z.number().min(1).max(50).default(20),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(data.limit);

      if (error) {
        console.error("Error loading chat history:", error);
        return { messages: [], error: error.message };
      }

      // Reverse to get chronological order
      return { 
        messages: (messages || []).reverse().map(m => ({
          role: m.role,
          content: m.content, // Use 'content' from database
          timestamp: m.created_at,
        })),
      };
    } catch (error) {
      console.error("Error loading chat history:", error);
      return { messages: [], error: "Failed to load chat history" };
    }
  });


/**
 * Generate speech audio for text
 * Routes to appropriate TTS provider based on language
 */
export const generateSpeech = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        text: z.string().min(1).max(5000),
        language: z.enum(["en", "tw", "ak", "fat", "dag", "dga", "gur", "kus", "ksm", "ee", "ga", "gon", "kpo", "nic"]).default("en"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const language = data.language as AppLangCode;
    
    // For English, use browser TTS or standard TTS provider
    if (language === "en") {
      return {
        useBrowserTTS: true,
        text: data.text,
        language: "en",
        message: "Using browser text-to-speech for English",
      };
    }

    // For Twi/Dagbani, use GhanaNLP TTS with caching
    try {
      const result = await getCachedOrGenerateTTS(data.text, language);
      
      console.log(`[TTS] Generated ${language} audio (cached: ${result.cached})`);
      
      return {
        audio: result.audio,
        format: result.format,
        language,
        cached: result.cached,
        provider: "ghananlp",
      };
    } catch (error) {
      console.error(`[TTS] GhanaNLP TTS failed for ${language}:`, error);
      
      // Fallback to browser TTS with English
      return {
        useBrowserTTS: true,
        text: data.text, // Try with original text
        language: "en",
        fallback: true,
        warning: `${language === "tw" ? "Twi" : "Dagbani"} voice unavailable - using English audio`,
        error: (error as Error).message,
      };
    }
  });

/**
 * Check Khaya service status
 */
export const checkKhayaStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { checkKhayaStatus } = await import("@/lib/khaya.server");
    return await checkKhayaStatus();
  });
