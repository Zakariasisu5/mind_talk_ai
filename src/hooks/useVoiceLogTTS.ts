import { useState, useCallback, useRef, useEffect } from "react";
import { useSpeech } from "@/lib/speech";

type TTSState = {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
};

type VoiceLogTTSCache = Map<string, boolean>; // logId -> hasGenerated

export function useVoiceLogTTS() {
  const { speak, stop, speakingId, muted } = useSpeech();
  const [states, setStates] = useState<Map<string, TTSState>>(new Map());
  const cacheRef = useRef<VoiceLogTTSCache>(new Map());
  const pendingRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Sync playing state when speakingId changes externally
  useEffect(() => {
    if (speakingId === null) {
      // Audio stopped, update all states
      setStates((prev) => {
        const next = new Map(prev);
        let changed = false;
        next.forEach((state, id) => {
          if (state.isPlaying || state.isLoading) {
            next.set(id, { ...state, isPlaying: false, isLoading: false });
            changed = true;
          }
        });
        return changed ? next : prev;
      });
      
      // Clear all pending timeouts
      pendingRef.current.forEach((timeout) => clearTimeout(timeout));
      pendingRef.current.clear();
    }
  }, [speakingId]);

  const updateState = useCallback((logId: string, update: Partial<TTSState>) => {
    setStates((prev) => {
      const next = new Map(prev);
      const current = next.get(logId) || { isPlaying: false, isLoading: false, error: null };
      next.set(logId, { ...current, ...update });
      return next;
    });
  }, []);

  const playVoiceLog = useCallback(
    async (logId: string, text: string) => {
      // Check if muted
      if (muted) {
        updateState(logId, { error: "Audio is muted" });
        return;
      }

      // Check if text is empty
      if (!text || text.trim().length === 0) {
        updateState(logId, { error: "No text to play" });
        return;
      }

      // Stop any currently playing log
      if (speakingId && speakingId !== logId) {
        stop();
        setStates((prev) => {
          const next = new Map(prev);
          next.forEach((state, id) => {
            if (id !== logId) {
              next.set(id, { ...state, isPlaying: false });
            }
          });
          return next;
        });
      }

      const isFirstPlay = !cacheRef.current.get(logId);
      
      // Show loading state only on first play
      if (isFirstPlay) {
        updateState(logId, { isLoading: true, error: null });
      } else {
        updateState(logId, { isPlaying: true, error: null });
      }

      try {
        // Start playback
        await speak(text, { id: logId });
        
        // Set a timeout to detect if TTS failed silently
        const timeout = setTimeout(() => {
          const currentState = states.get(logId);
          // Only show error if we're still in loading state
          if (currentState?.isLoading || (speakingId !== logId && currentState && !currentState.isPlaying)) {
            console.error("TTS timeout for log:", logId, "speakingId:", speakingId);
            updateState(logId, { 
              isLoading: false, 
              isPlaying: false, 
              error: "TTS not configured" 
            });
          }
        }, 5000);
        
        pendingRef.current.set(logId, timeout);
        
        // Mark as cached after starting playback
        if (isFirstPlay) {
          cacheRef.current.set(logId, true);
        }

        // The actual playing state will be updated by the speakingId effect
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to play audio";
        updateState(logId, { isLoading: false, isPlaying: false, error: errorMessage });
        console.error("TTS error for log", logId, error);
        
        // Clear timeout
        const timeout = pendingRef.current.get(logId);
        if (timeout) {
          clearTimeout(timeout);
          pendingRef.current.delete(logId);
        }
      }
    },
    [speak, stop, speakingId, muted, updateState, states],
  );

  const stopVoiceLog = useCallback(
    (logId: string) => {
      stop();
      updateState(logId, { isPlaying: false, error: null });
      
      // Clear timeout if exists
      const timeout = pendingRef.current.get(logId);
      if (timeout) {
        clearTimeout(timeout);
        pendingRef.current.delete(logId);
      }
    },
    [stop, updateState],
  );

  const getState = useCallback(
    (logId: string): TTSState => {
      const state = states.get(logId);
      const isCurrentlyPlaying = speakingId === logId;
      
      // If we're currently playing this log, update the state
      if (isCurrentlyPlaying && state) {
        // Clear the pending timeout since we know it's playing
        const timeout = pendingRef.current.get(logId);
        if (timeout) {
          clearTimeout(timeout);
          pendingRef.current.delete(logId);
        }
        
        return {
          ...state,
          isPlaying: true,
          isLoading: false,
        };
      }
      
      if (state) {
        return {
          ...state,
          isPlaying: isCurrentlyPlaying,
        };
      }
      
      return {
        isPlaying: isCurrentlyPlaying,
        isLoading: false,
        error: null,
      };
    },
    [states, speakingId],
  );

  return {
    playVoiceLog,
    stopVoiceLog,
    getState,
  };
}
