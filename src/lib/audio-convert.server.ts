/**
 * Audio Conversion Utilities for MindTalk AI
 * 
 * Converts various audio formats to WAV for Khaya ASR compatibility
 * Uses ffmpeg for robust format conversion
 */

import ffmpeg from "fluent-ffmpeg";
import { createRequire } from "module";
import { PassThrough } from "stream";

// Use createRequire to load ffmpeg-static in ESM context (fixes Vercel build)
const require = createRequire(import.meta.url);
const ffmpegPath: string = require("ffmpeg-static");

// Set ffmpeg binary path
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

/**
 * Detect audio format from buffer or mime type
 */
export function detectAudioFormat(format?: string): string {
  if (!format) return "webm";
  
  const formatMap: Record<string, string> = {
    "webm": "webm",
    "m4a": "mp4",
    "mp4": "mp4",
    "wav": "wav",
    "mp3": "mp3",
    "ogg": "ogg",
  };
  
  return formatMap[format.toLowerCase()] || "webm";
}

/**
 * Convert audio bytes (webm, m4a, mp4, etc.) to WAV for Khaya ASR compatibility.
 * 
 * @param inputBuffer - Raw audio data as Buffer
 * @param inputFormat - Input format (webm, m4a, mp4, wav, mp3, ogg)
 * @returns Promise<Buffer> - WAV audio data
 */
export function convertToWav(
  inputBuffer: Buffer,
  inputFormat: string = "webm"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    console.log(`[AudioConvert] Converting ${inputBuffer.length} bytes from ${inputFormat} to WAV`);
    
    const input = new PassThrough();
    input.end(inputBuffer);

    const chunks: Buffer[] = [];
    const output = new PassThrough();

    output.on("data", (chunk) => chunks.push(chunk));
    output.on("end", () => {
      const result = Buffer.concat(chunks);
      console.log(`[AudioConvert] Conversion complete: ${result.length} bytes WAV`);
      resolve(result);
    });
    output.on("error", (err) => {
      console.error("[AudioConvert] Output stream error:", err);
      reject(err);
    });

    const detectedFormat = detectAudioFormat(inputFormat);

    ffmpeg(input)
      .inputFormat(detectedFormat)
      .audioCodec("pcm_s16le") // 16-bit PCM
      .audioChannels(1) // Mono
      .audioFrequency(16000) // 16kHz sample rate (good for speech)
      .format("wav")
      .on("start", (commandLine) => {
        console.log(`[AudioConvert] FFmpeg command: ${commandLine}`);
      })
      .on("error", (err) => {
        console.error("[AudioConvert] FFmpeg error:", err);
        reject(new Error(`Audio conversion failed: ${err.message}`));
      })
      .on("end", () => {
        console.log("[AudioConvert] FFmpeg processing complete");
      })
      .pipe(output, { end: true });
  });
}

/**
 * Check if audio is already in WAV format
 * Simple check based on WAV file header (RIFF...WAVE)
 */
export function isWavFormat(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  
  // Check for RIFF header
  const riff = buffer.toString("ascii", 0, 4);
  const wave = buffer.toString("ascii", 8, 12);
  
  return riff === "RIFF" && wave === "WAVE";
}

/**
 * Convert audio to WAV only if necessary
 * In serverless environments (Vercel), skip conversion
 */
export async function ensureWavFormat(
  audioBuffer: Buffer,
  format?: string
): Promise<Buffer> {
  // If already WAV, return as-is
  if (isWavFormat(audioBuffer)) {
    console.log("[AudioConvert] Audio is already in WAV format");
    return audioBuffer;
  }
  
  // Check if we're in a serverless environment (Vercel, Netlify, etc.)
  const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  if (isServerless) {
    console.warn("[AudioConvert] Serverless environment detected, skipping conversion");
    console.warn("[AudioConvert] Khaya will attempt to handle the original format");
    return audioBuffer;
  }
  
  // Otherwise convert
  return convertToWav(audioBuffer, format);
}

/**
 * Validate audio buffer size
 */
export function validateAudioSize(buffer: Buffer, maxSizeMB: number = 25): void {
  const sizeMB = buffer.length / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    throw new Error(`Audio file too large: ${sizeMB.toFixed(2)}MB (max ${maxSizeMB}MB)`);
  }
}
