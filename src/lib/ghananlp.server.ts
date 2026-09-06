/**
 * GhanaNLP API Client for MindTalk AI
 * 
 * Provides speech-to-text, text-to-speech, and translation
 * for Twi (tw) and Dagbani (dag) languages.
 * 
 * API Documentation: https://translation.ghananlp.org
 */

const GHANANLP_BASE_URL = "https://translation.ghananlp.org";

export type GhanaNLPLanguage = "en" | "tw" | "dag" | "ee" | "ga" | "kpo" | "gur" | "ak" | "fat" | "ksm" | "nic" | "dga" | "gon" | "kus";

export class GhanaNLPError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "GhanaNLPError";
  }
}

/**
 * Map language codes to GhanaNLP API format
 */
const LANGUAGE_MAP: Record<GhanaNLPLanguage, string> = {
  en: "english",
  tw: "twi",           // Twi (Akan)
  dag: "dagbani",      // Dagbani
  ee: "ewe",           // Ewe
  ga: "ga",            // Ga
  kpo: "ikposo",       // Ikposo
  gur: "gurene",       // Gurene (Frafra)
  ak: "akuapem",       // Akuapem Twi
  fat: "fante",        // Fante
  ksm: "kasem",        // Kasem
  nic: "nzema",        // Nzema
  dga: "dagaare",      // Dagaare (Upper West)
  gon: "gonja",        // Gonja (Savannah)
  kus: "kusaal",       // Kusaal (Upper East)
};

/**
 * Get language name in English
 */
export function getLanguageName(code: GhanaNLPLanguage): string {
  const names: Record<GhanaNLPLanguage, string> = {
    en: "English",
    tw: "Twi",
    dag: "Dagbani",
    ee: "Ewe",
    ga: "Ga",
    kpo: "Ikposo",
    gur: "Gurene",
    ak: "Akuapem Twi",
    fat: "Fante",
    ksm: "Kasem",
    nic: "Nzema",
    dga: "Dagaare",
    gon: "Gonja",
    kus: "Kusaal",
  };
  return names[code] || code;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): Array<{ code: GhanaNLPLanguage; name: string; nativeVoice: boolean; region: string }> {
  return [
    { code: "en", name: "English", nativeVoice: true, region: "Nationwide" },
    
    // Akan Languages (Central/Southern)
    { code: "tw", name: "Twi (Akan)", nativeVoice: true, region: "Ashanti, Central" },
    { code: "ak", name: "Akuapem Twi", nativeVoice: true, region: "Eastern" },
    { code: "fat", name: "Fante", nativeVoice: true, region: "Central, Western" },
    
    // Gur/Mole-Dagbani Languages (Northern)
    { code: "dag", name: "Dagbani", nativeVoice: true, region: "Northern" },
    { code: "dga", name: "Dagaare", nativeVoice: true, region: "Upper West" },
    { code: "gur", name: "Gurene (Frafra)", nativeVoice: true, region: "Upper East" },
    { code: "kus", name: "Kusaal", nativeVoice: true, region: "Upper East" },
    { code: "ksm", name: "Kasem", nativeVoice: false, region: "Upper East" },
    
    // Other Major Languages
    { code: "ee", name: "Ewe", nativeVoice: true, region: "Volta, Oti" },
    { code: "ga", name: "Ga", nativeVoice: true, region: "Greater Accra" },
    { code: "gon", name: "Gonja", nativeVoice: true, region: "Savannah" },
    
    // Smaller Languages
    { code: "kpo", name: "Ikposo", nativeVoice: false, region: "Oti" },
    { code: "nic", name: "Nzema", nativeVoice: false, region: "Western" },
  ];
}
  const apiKey = process.env["GHANANLP_API_KEY"];
  if (!apiKey || apiKey === "your-ghananlp-api-key-here") {
    throw new GhanaNLPError(
      401,
      "GhanaNLP API key not configured. Please add GHANANLP_API_KEY to your environment."
    );
  }
  return apiKey;
}

/**
 * Make a request to GhanaNLP API
 */
async function makeRequest(
  endpoint: string,
  body: Record<string, unknown>,
  timeout: number = 30000
): Promise<Response> {
  const apiKey = getApiKey();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${GHANANLP_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey, // GhanaNLP uses this header
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error)?.name === "AbortError") {
      throw new GhanaNLPError(
        408,
        "GhanaNLP request timed out. The service may be experiencing high load."
      );
    }
    throw error;
  }
}

/**
 * Speech-to-Text (ASR) - Transcribe audio to text
 * 
 * @param audioBase64 - Base64-encoded audio data
 * @param language - Language code: "tw" (Twi) or "dag" (Dagbani)
 * @param format - Audio format (wav, mp3, etc.)
 * @returns Transcription result with confidence score
 */
export async function transcribeAudio(
  audioBase64: string,
  language: GhanaNLPLanguage,
  format: string = "wav"
): Promise<{
  text: string;
  confidence?: number;
  language: string;
  verified: boolean;
}> {
  if (language === "en") {
    throw new GhanaNLPError(
      400,
      "English transcription should use Whisper, not GhanaNLP"
    );
  }

  try {
    console.log(`[GhanaNLP] Starting ASR transcription for language: ${language}`);
    
    const response = await makeRequest(
      "/asr/v1/transcribe",
      {
        audio: audioBase64,
        language: LANGUAGE_MAP[language],
        format,
      },
      45000 // 45 second timeout for ASR
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`[GhanaNLP] ASR failed (${response.status}):`, errorText);
      throw new GhanaNLPError(
        response.status,
        `GhanaNLP ASR failed: ${errorText}`
      );
    }

    const result = await response.json() as {
      transcription?: string;
      text?: string;
      confidence?: number;
    };

    const text = result.transcription || result.text || "";
    const confidence = result.confidence ?? 0;

    console.log(`[GhanaNLP] ASR success - confidence: ${confidence}`);

    // Flag as unverified if confidence is low
    const verified = confidence >= 0.7;

    return {
      text,
      confidence,
      language,
      verified,
    };
  } catch (error) {
    if (error instanceof GhanaNLPError) {
      throw error;
    }
    console.error("[GhanaNLP] ASR error:", error);
    throw new GhanaNLPError(
      500,
      `Failed to transcribe audio: ${(error as Error).message}`
    );
  }
}

/**
 * Text-to-Speech (TTS) - Convert text to audio
 * 
 * @param text - Text to convert to speech
 * @param language - Language code: "tw" (Twi) or "dag" (Dagbani)
 * @returns Audio data as base64 string
 */
export async function synthesizeSpeech(
  text: string,
  language: GhanaNLPLanguage
): Promise<{
  audio: string; // base64-encoded audio
  format: string;
}> {
  if (language === "en") {
    throw new GhanaNLPError(
      400,
      "English TTS should use Google/Azure/ElevenLabs, not GhanaNLP"
    );
  }

  try {
    console.log(`[GhanaNLP] Starting TTS synthesis for language: ${language}`);
    
    const response = await makeRequest(
      "/tts/v1/synthesize",
      {
        text: text.slice(0, 5000), // Limit text length
        language: LANGUAGE_MAP[language],
        format: "mp3",
      },
      60000 // 60 second timeout for TTS
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`[GhanaNLP] TTS failed (${response.status}):`, errorText);
      throw new GhanaNLPError(
        response.status,
        `GhanaNLP TTS failed: ${errorText}`
      );
    }

    const result = await response.json() as {
      audio?: string;
      audioContent?: string;
      format?: string;
    };

    const audio = result.audio || result.audioContent || "";
    
    if (!audio) {
      throw new GhanaNLPError(500, "TTS returned empty audio");
    }

    console.log(`[GhanaNLP] TTS success - audio length: ${audio.length}`);

    return {
      audio,
      format: result.format || "mp3",
    };
  } catch (error) {
    if (error instanceof GhanaNLPError) {
      throw error;
    }
    console.error("[GhanaNLP] TTS error:", error);
    throw new GhanaNLPError(
      500,
      `Failed to synthesize speech: ${(error as Error).message}`
    );
  }
}

/**
 * Translate text between languages
 * 
 * @param text - Text to translate
 * @param fromLang - Source language code
 * @param toLang - Target language code
 * @returns Translated text
 */
export async function translateText(
  text: string,
  fromLang: GhanaNLPLanguage,
  toLang: GhanaNLPLanguage
): Promise<{
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
}> {
  if (fromLang === toLang) {
    return {
      translatedText: text,
      fromLanguage: fromLang,
      toLanguage: toLang,
    };
  }

  try {
    console.log(`[GhanaNLP] Translating from ${fromLang} to ${toLang}`);

    const response = await makeRequest(
      "/translate/v1",
      {
        text,
        source_language: LANGUAGE_MAP[fromLang],
        target_language: LANGUAGE_MAP[toLang],
      },
      30000 // 30 second timeout
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`[GhanaNLP] Translation failed (${response.status}):`, errorText);
      throw new GhanaNLPError(
        response.status,
        `GhanaNLP translation failed: ${errorText}`
      );
    }

    const result = await response.json() as {
      translation?: string;
      translatedText?: string;
      translated_text?: string;
    };

    const translatedText = 
      result.translation || 
      result.translatedText || 
      result.translated_text || 
      text; // Fallback to original text

    console.log(`[GhanaNLP] Translation success`);

    return {
      translatedText,
      fromLanguage: fromLang,
      toLanguage: toLang,
    };
  } catch (error) {
    if (error instanceof GhanaNLPError) {
      throw error;
    }
    console.error("[GhanaNLP] Translation error:", error);
    throw new GhanaNLPError(
      500,
      `Failed to translate text: ${(error as Error).message}`
    );
  }
}

/**
 * Check if GhanaNLP API is configured and available
 */
export async function checkGhanaNLPStatus(): Promise<{
  configured: boolean;
  available: boolean;
  message: string;
}> {
  try {
    const apiKey = process.env["GHANANLP_API_KEY"];
    if (!apiKey || apiKey === "your-ghananlp-api-key-here") {
      return {
        configured: false,
        available: false,
        message: "GhanaNLP API key not configured",
      };
    }

    // Try a simple translation to test connectivity
    await translateText("hello", "en", "tw");

    return {
      configured: true,
      available: true,
      message: "GhanaNLP is operational",
    };
  } catch (error) {
    return {
      configured: true,
      available: false,
      message: `GhanaNLP unavailable: ${(error as Error).message}`,
    };
  }
}

/**
 * Audio cache for TTS responses
 * Key format: "language:hash(text)"
 */
const audioCache = new Map<string, { audio: string; format: string; timestamp: number }>();
const AUDIO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached TTS audio or generate new
 */
export async function getCachedOrGenerateTTS(
  text: string,
  language: GhanaNLPLanguage
): Promise<{ audio: string; format: string; cached: boolean }> {
  // Create cache key
  const textHash = hashString(text);
  const cacheKey = `${language}:${textHash}`;

  // Check cache
  const cached = audioCache.get(cacheKey);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < AUDIO_CACHE_TTL) {
      console.log(`[GhanaNLP] TTS cache hit for key: ${cacheKey}`);
      return { ...cached, cached: true };
    } else {
      // Expired, remove from cache
      audioCache.delete(cacheKey);
    }
  }

  // Generate new audio
  const result = await synthesizeSpeech(text, language);
  
  // Cache it
  audioCache.set(cacheKey, {
    audio: result.audio,
    format: result.format,
    timestamp: Date.now(),
  });

  // Clean up old cache entries
  if (audioCache.size > 200) {
    const now = Date.now();
    for (const [key, value] of audioCache.entries()) {
      if (now - value.timestamp > AUDIO_CACHE_TTL) {
        audioCache.delete(key);
      }
    }
  }

  return { ...result, cached: false };
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
