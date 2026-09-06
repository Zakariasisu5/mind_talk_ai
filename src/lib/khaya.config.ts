/**
 * Khaya AI Configuration
 * 
 * Khaya provides ASR v3, TTS v2, and Translation v2 for Ghanaian languages
 * API Documentation: https://developer-api.khaya.ai
 */

export const KHAYA_BASE_URL = "https://developer-api.khaya.ai";

/**
 * Map MindTalk AI's internal language codes to Khaya's ISO 639-3 codes
 * 
 * Note: Khaya uses ISO 639-3 standard codes
 * Translation and TTS APIs use these codes consistently
 */
export const KHAYA_LANG_MAP = {
  // English
  en: "eng",
  
  // Akan Languages
  tw: "twi",   // Asante Twi (most common)
  ak: "akp",   // Akuapem Twi
  fat: "fat",  // Fante
  
  // Northern Languages (Gur/Mole-Dagbani)
  dag: "dag",  // Dagbani
  dga: "dga",  // Dagaare
  gur: "gur",  // Gurene (Frafra)
  kus: "kus",  // Kusaal
  ksm: "xsm",  // Kasem
  
  // Other Major Languages
  ee: "ewe",   // Ewe
  ga: "gaa",   // Ga
  gon: "gjn",  // Gonja
  
  // Smaller Languages
  kpo: "kpo",  // Ikposo
  nic: "nzi",  // Nzema
} as const;

export type AppLangCode = keyof typeof KHAYA_LANG_MAP;
export type KhayaLangCode = typeof KHAYA_LANG_MAP[AppLangCode];

/**
 * Audio formats Khaya ASR v3 accepts
 */
export const SUPPORTED_ASR_CONTENT_TYPES: Record<string, string> = {
  wav: "audio/wav",
  mp3: "audio/mpeg",
  flac: "audio/flac",
  ogg: "audio/ogg",
  webm: "audio/webm",
  m4a: "audio/mp4",
};

/**
 * TTS speaker options
 */
export const TTS_SPEAKERS = {
  female: "female",
  male_low: "male_low",
  male_high: "male_high",
} as const;

export type TTSSpeaker = keyof typeof TTS_SPEAKERS;

export const DEFAULT_TTS_SPEAKER: TTSSpeaker = "female";

/**
 * API endpoint paths
 */
export const KHAYA_ENDPOINTS = {
  asr: "/asr/v3/transcribe",
  tts: "/tts/v2/synthesize",
  translation: "/translate/v2",
} as const;

/**
 * Get language name from code
 */
export function getKhayaLanguageName(code: AppLangCode): string {
  const names: Record<AppLangCode, string> = {
    en: "English",
    tw: "Twi (Asante)",
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
  };
  return names[code] || code;
}

/**
 * Check if language is supported by Khaya
 */
export function isKhayaSupported(code: string): code is AppLangCode {
  return code in KHAYA_LANG_MAP;
}

/**
 * Get Khaya ISO code from app language code
 */
export function toKhayaCode(appCode: AppLangCode): KhayaLangCode {
  return KHAYA_LANG_MAP[appCode];
}

/**
 * ASR v3 Configuration
 */
export const ASR_CONFIG = {
  maxAudioSize: 25 * 1024 * 1024, // 25MB max file size
  timeout: 60000, // 60 second timeout
  supportedFormats: ["wav", "mp3", "flac", "ogg", "webm", "m4a"],
} as const;

/**
 * TTS v2 Configuration
 */
export const TTS_CONFIG = {
  maxTextLength: 5000, // 5000 characters max
  timeout: 45000, // 45 second timeout
  cacheEnabled: true,
  cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Translation v2 Configuration
 */
export const TRANSLATION_CONFIG = {
  maxTextLength: 5000,
  timeout: 30000, // 30 second timeout
  batchSize: 10, // Max texts per batch request
} as const;
