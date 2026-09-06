/**
 * Unified Transcription Service for MindTalk AI
 * 
 * Routes audio transcription to the appropriate provider:
 * - English → Whisper API (OpenAI) or fallback
 * - Twi/Dagbani → Khaya ASR (with audio conversion)
 */

import { transcribeAudio as khayaTranscribe, type AppLangCode } from "./khaya.server";

export type TranscriptionLanguage = "en" | "tw" | "ak" | "fat" | "dag" | "dga" | "gur" | "kus" | "ksm" | "ee" | "ga" | "gon" | "kpo" | "nic";

export interface TranscriptionResult {
  text: string;
  language: TranscriptionLanguage;
  confidence?: number;
  verified: boolean;
  provider: "whisper" | "ghananlp" | "mock";
  warning?: string;
}

/**
 * Transcribe audio using the appropriate provider based on language
 */
export async function transcribeAudio(
  audioBase64: string,
  language: TranscriptionLanguage,
  format: string = "webm"
): Promise<TranscriptionResult> {
  console.log(`[Transcription] Starting transcription for language: ${language}, format: ${format}`);

  // Route to appropriate provider
  if (language === "en") {
    return await transcribeEnglish(audioBase64, format);
  } else {
    return await transcribeLocalLanguage(audioBase64, language as AppLangCode, format);
  }
}

/**
 * Helper function to dynamically import audio conversion and transcribe
 * This prevents audio-convert.server from being bundled in the initial load
 */
async function transcribeAudioFromRawBytes(
  rawAudio: Buffer,
  format: string,
  language: AppLangCode | "en"
): Promise<{ text: string; confidence?: number }> {
  try {
    // Dynamic import prevents ffmpeg from loading at build time
    const { ensureWavFormat, validateAudioSize } = await import("./audio-convert.server");
    
    validateAudioSize(rawAudio, 25);
    
    let wavBuffer: Buffer;
    let finalFormat: "wav" | "mp3" | "ogg" = "wav";
    
    try {
      wavBuffer = await ensureWavFormat(rawAudio, format);
      finalFormat = "wav";
    } catch (conversionError) {
      console.warn(`[Transcription] Audio conversion failed, trying direct transcription`);
      wavBuffer = rawAudio;
      finalFormat = format === "webm" || format === "m4a" || format === "mp4" ? "mp3" : (format as "wav" | "mp3" | "ogg");
    }
    
    return await khayaTranscribe(wavBuffer, finalFormat, language);
  } catch (err) {
    console.error("Voice conversion/transcription failed:", err);
    throw new Error("Voice transcription is temporarily unavailable. Please try again shortly.");
  }
}

/**
 * Transcribe English audio using Khaya ASR
 * Falls back to mock only if Khaya is not configured
 */
async function transcribeEnglish(
  audioBase64: string,
  format: string
): Promise<TranscriptionResult> {
  try {
    const apiKey = process.env["KHAYA_API_KEY"];
    console.log(`[Transcription] KHAYA_API_KEY check: ${apiKey ? 'SET (length: ' + apiKey.length + ')' : 'NOT SET'}`);
    
    // If Khaya is configured, use it for English transcription
    if (apiKey && apiKey !== "your-khaya-api-key-here") {
      console.log("[Transcription] Using Khaya for English transcription");
      
      try {
        const audioBuffer = Buffer.from(audioBase64, "base64");
        console.log(`[Transcription] Audio buffer size: ${audioBuffer.length} bytes`);
        
        const result = await transcribeAudioFromRawBytes(audioBuffer, format, "en");
        
        console.log(`[Transcription] Khaya English transcription complete: ${result.text?.substring(0, 50)}...`);
        
        const verified = (result.confidence ?? 0) > 0.7;
        
        return {
          text: result.text,
          language: "en",
          confidence: result.confidence,
          verified,
          provider: "ghananlp",
          warning: verified ? undefined : "Low confidence - please review",
        };
      } catch (khayaError) {
        console.error("[Transcription] Khaya transcription failed:", khayaError);
        throw khayaError;
      }
    }
    
    // Check if OpenAI is configured as alternative
    const openaiKey = process.env["OPENAI_API_KEY"];
    if (openaiKey && openaiKey !== "your-openai-api-key-here") {
      console.warn("[Transcription] OpenAI configured but not yet implemented, using mock");
      // TODO: Implement Whisper API call here if needed
    }
    
    // Fallback to mock if neither API is configured
    console.warn("[Transcription] Neither Khaya nor OpenAI configured, using mock transcription");
    console.warn(`[Transcription] KHAYA_API_KEY value: "${apiKey}"`);
    return {
      text: "[Mock English transcription - Please set up Khaya API key or Whisper API for actual transcription]",
      language: "en",
      verified: false,
      provider: "mock",
      warning: "No transcription service configured. Add KHAYA_API_KEY to .env to enable English transcription.",
    };
  } catch (error) {
    console.error("[Transcription] English transcription error:", error);
    return {
      text: "[Transcription failed - Please try again]",
      language: "en",
      verified: false,
      provider: "mock",
      warning: `Transcription error: ${(error as Error).message}`,
    };
  }
}

/**
 * Transcribe Twi, Dagbani, or other local language audio using Khaya
 * Automatically converts audio to WAV format for Khaya compatibility
 */
async function transcribeLocalLanguage(
  audioBase64: string,
  language: AppLangCode,
  format: string
): Promise<TranscriptionResult> {
  try {
    console.log(`[Transcription] Starting Khaya transcription for ${language}, format: ${format}`);
    
    const audioBuffer = Buffer.from(audioBase64, "base64");
    console.log(`[Transcription] Audio buffer size: ${audioBuffer.length} bytes`);
    
    const result = await transcribeAudioFromRawBytes(audioBuffer, format, language);
    
    console.log(`[Transcription] Khaya transcription complete: ${result.text?.substring(0, 50)}...`);
    
    const verified = (result.confidence ?? 0) > 0.7;
    const warning = verified ? undefined : "Low confidence transcription - please review and edit if needed";

    return {
      text: result.text,
      language: language as TranscriptionLanguage,
      confidence: result.confidence,
      verified,
      provider: "ghananlp",
      warning,
    };
  } catch (error) {
    console.error(`[Transcription] Khaya ${language} transcription error:`, error);
    
    return {
      text: `[Transcription failed for ${language} - Khaya unavailable]`,
      language: language as TranscriptionLanguage,
      verified: false,
      provider: "ghananlp",
      warning: `Khaya transcription failed: ${(error as Error).message}. Please try again or switch to English.`,
    };
  }
}

/**
 * Convert audio format to a standardized format for transcription
 * Helps with compatibility across different providers
 */
export function normalizeAudioFormat(format: string): string {
  const formatMap: Record<string, string> = {
    "mp4": "m4a",
    "webm": "webm",
    "m4a": "m4a",
    "wav": "wav",
    "mp3": "mp3",
    "ogg": "ogg",
  };
  
  return formatMap[format.toLowerCase()] || "webm";
}
