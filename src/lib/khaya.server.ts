/**
 * Khaya AI Client for MindTalk AI
 * 
 * Provides ASR v3, TTS v2, and Translation v2 APIs
 * for Ghanaian languages via Khaya platform
 * 
 * API Documentation: https://developer-api.khaya.ai
 */

import {
  KHAYA_BASE_URL,
  KHAYA_LANG_MAP,
  SUPPORTED_ASR_CONTENT_TYPES,
  DEFAULT_TTS_SPEAKER,
  TTS_CONFIG,
  type AppLangCode,
} from "./khaya.config";

export class KhayaError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getApiKey(): string {
  const key = process.env["KHAYA_API_KEY"];
  if (!key) {
    throw new KhayaError(401, "Khaya AI is not configured. Please add KHAYA_API_KEY to your environment.");
  }
  return key;
}

async function handleErrorResponse(response: Response): Promise<never> {
  let message = `Khaya API error: ${response.status}`;
  let code: string | undefined;
  try {
    const body = await response.json();
    if (body?.error?.message) message = body.error.message;
    if (body?.error?.code) code = body.error.code;
  } catch {
    // response wasn't JSON, keep default message
  }
  throw new KhayaError(response.status, message, code);
}

/**
 * Translate text between English and Twi/Dagbani using Translation API v2.
 * direction: "toLocal" translates English -> target language, "toEnglish" reverses it.
 */
export async function translateText(
  text: string,
  targetLang: AppLangCode,
  direction: "toLocal" | "toEnglish" = "toLocal"
): Promise<string> {
  if (targetLang === "en") return text; // no-op

  const localCode = KHAYA_LANG_MAP[targetLang];
  const lang = direction === "toLocal" ? `eng-${localCode}` : `${localCode}-eng`;

  const response = await fetch(`${KHAYA_BASE_URL}/v2/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": getApiKey(),
    },
    body: JSON.stringify({ in: text, lang }),
  });

  if (!response.ok) await handleErrorResponse(response);

  // Response is a raw JSON string per the spec, not an object
  const translated = await response.json();
  return typeof translated === "string" ? translated : text;
}

/**
 * Transcribe audio to text using ASR v3.
 * audioBuffer must already be in wav, mp3, flac, or ogg — convert before calling if needed.
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  format: keyof typeof SUPPORTED_ASR_CONTENT_TYPES,
  language: AppLangCode
): Promise<{ text: string; confidence?: number }> {
  const contentType = SUPPORTED_ASR_CONTENT_TYPES[format];
  if (!contentType) {
    throw new KhayaError(
      400,
      `Unsupported audio format "${format}" for Khaya ASR. Use wav, mp3, flac, or ogg.`
    );
  }

  const langCode = KHAYA_LANG_MAP[language];
  const url = `${KHAYA_BASE_URL}/asr/v3/transcribe?language=${encodeURIComponent(langCode)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "Ocp-Apim-Subscription-Key": getApiKey(),
    },
    body: audioBuffer,
  });

  if (!response.ok) await handleErrorResponse(response);

  const result = await response.json();
  return { 
    text: result.text ?? "",
    confidence: result.confidence 
  };
}

/**
 * Synthesize speech from text using TTS v2.
 * Returns raw audio bytes (wav by default) — caller decides how to serve/cache them.
 */
export async function synthesizeSpeech(
  text: string,
  language: AppLangCode,
  options?: { speakerId?: "male_low" | "male_high" | "female"; format?: "wav" | "mp3" | "ogg" }
): Promise<Buffer> {
  const langCode = KHAYA_LANG_MAP[language];

  const response = await fetch(`${KHAYA_BASE_URL}/tts/v2/synthesize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": getApiKey(),
    },
    body: JSON.stringify({
      text,
      language: langCode,
      speaker_id: options?.speakerId ?? DEFAULT_TTS_SPEAKER,
      format: options?.format ?? "wav",
      stream: false,
    }),
  });

  if (!response.ok) await handleErrorResponse(response);

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Audio cache for TTS responses
 * Key format: "language:speaker:hash(text)"
 */
const audioCache = new Map<string, { audio: Buffer; format: string; timestamp: number }>();

/**
 * Get cached TTS audio or generate new
 */
export async function getCachedOrGenerateTTS(
  text: string,
  language: AppLangCode,
  options?: { speakerId?: "male_low" | "male_high" | "female"; format?: "wav" | "mp3" | "ogg" }
): Promise<{ audio: Buffer; format: string; cached: boolean }> {
  if (!TTS_CONFIG.cacheEnabled) {
    const audio = await synthesizeSpeech(text, language, options);
    return { audio, format: options?.format ?? "wav", cached: false };
  }

  // Create cache key
  const textHash = hashString(text);
  const speaker = options?.speakerId ?? DEFAULT_TTS_SPEAKER;
  const format = options?.format ?? "wav";
  const cacheKey = `${language}:${speaker}:${format}:${textHash}`;

  // Check cache
  const cached = audioCache.get(cacheKey);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < TTS_CONFIG.cacheTTL) {
      console.log(`[Khaya TTS] Cache hit for key: ${cacheKey}`);
      return { audio: cached.audio, format: cached.format, cached: true };
    } else {
      // Expired, remove from cache
      audioCache.delete(cacheKey);
    }
  }

  // Generate new audio
  const audio = await synthesizeSpeech(text, language, options);
  
  // Cache it
  audioCache.set(cacheKey, {
    audio,
    format,
    timestamp: Date.now(),
  });

  // Clean up old cache entries
  if (audioCache.size > 200) {
    const now = Date.now();
    for (const [key, value] of audioCache.entries()) {
      if (now - value.timestamp > TTS_CONFIG.cacheTTL) {
        audioCache.delete(key);
      }
    }
  }

  return { audio, format, cached: false };
}

/**
 * Check if Khaya API is configured and available
 */
export async function checkKhayaStatus(): Promise<{
  configured: boolean;
  available: boolean;
  message: string;
}> {
  try {
    const apiKey = process.env["KHAYA_API_KEY"];
    if (!apiKey) {
      return {
        configured: false,
        available: false,
        message: "Khaya API key not configured",
      };
    }

    // Try a simple translation to test connectivity
    await translateText("hello", "tw", "toLocal");

    return {
      configured: true,
      available: true,
      message: "Khaya is operational",
    };
  } catch (error) {
    return {
      configured: true,
      available: false,
      message: `Khaya unavailable: ${(error as Error).message}`,
    };
  }
}

/**
 * Simple string hash function for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): Array<{ 
  code: AppLangCode; 
  name: string; 
  khayaCode: string;
  nativeVoice: boolean;
  region: string;
}> {
  return [
    { code: "en", name: "English", khayaCode: "eng", nativeVoice: false, region: "Nationwide" },
    
    // Akan Languages
    { code: "tw", name: "Twi (Asante)", khayaCode: "twi", nativeVoice: true, region: "Ashanti, Central" },
    { code: "ak", name: "Akuapem Twi", khayaCode: "akp", nativeVoice: true, region: "Eastern" },
    { code: "fat", name: "Fante", khayaCode: "fat", nativeVoice: true, region: "Central, Western" },
    
    // Northern Languages
    { code: "dag", name: "Dagbani", khayaCode: "dag", nativeVoice: true, region: "Northern" },
    { code: "dga", name: "Dagaare", khayaCode: "dga", nativeVoice: true, region: "Upper West" },
    { code: "gur", name: "Gurene", khayaCode: "gur", nativeVoice: true, region: "Upper East" },
    { code: "kus", name: "Kusaal", khayaCode: "kus", nativeVoice: true, region: "Upper East" },
    { code: "ksm", name: "Kasem", khayaCode: "xsm", nativeVoice: false, region: "Upper East" },
    
    // Other Major Languages
    { code: "ee", name: "Ewe", khayaCode: "ewe", nativeVoice: true, region: "Volta, Oti" },
    { code: "ga", name: "Ga", khayaCode: "gaa", nativeVoice: true, region: "Greater Accra" },
    { code: "gon", name: "Gonja", khayaCode: "gjn", nativeVoice: true, region: "Savannah" },
    
    // Smaller Languages
    { code: "kpo", name: "Ikposo", khayaCode: "kpo", nativeVoice: false, region: "Oti" },
    { code: "nic", name: "Nzema", khayaCode: "nzi", nativeVoice: false, region: "Western" },
  ];
}

// Re-export types for convenience
export type { AppLangCode };
