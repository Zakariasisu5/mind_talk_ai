import { Volume2, VolumeX, Loader2, AlertCircle } from "lucide-react";
import { useVoiceLogTTS } from "@/hooks/useVoiceLogTTS";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type VoiceLogSpeakerProps = {
  logId: string;
  text: string;
  language?: "en" | "tw" | "dag";
  className?: string;
};

export function VoiceLogSpeaker({
  logId,
  text,
  language = "en",
  className = "",
}: VoiceLogSpeakerProps) {
  const { playVoiceLog, stopVoiceLog, getState } = useVoiceLogTTS();
  const state = getState(logId);

  const handleClick = () => {
    console.log("VoiceLogSpeaker clicked:", { logId, text: text.substring(0, 50), state });
    
    if (state.isPlaying) {
      console.log("Stopping playback for:", logId);
      stopVoiceLog(logId);
    } else {
      console.log("Starting playback for:", logId);
      playVoiceLog(logId, text);
    }
  };

  const isNonEnglish = language !== "en";
  const tooltipContent = state.isPlaying
    ? "Stop audio"
    : state.isLoading
      ? "Generating audio..."
      : isNonEnglish
        ? "Listen to AI response (audio in English)"
        : "Listen to AI response";

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClick}
              disabled={state.isLoading}
              className="tap h-11 w-11 shrink-0 rounded-full"
              aria-label={tooltipContent}
            >
              {state.isLoading ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : state.isPlaying ? (
                <VolumeX className="size-5 text-primary" />
              ) : (
                <Volume2 className="size-5 text-muted-foreground hover:text-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isNonEnglish && !state.isLoading && !state.error && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">Audio in EN</span>
      )}

      {state.error && (
        <div className="flex flex-col items-center gap-1 text-center mt-1">
          <div className="flex items-center gap-1 text-destructive">
            <AlertCircle className="size-3 shrink-0" />
            <span className="text-[10px]">
              {state.error === "TTS not configured" 
                ? "Setup required"
                : state.error === "Audio is muted"
                  ? "Unmute audio"
                  : "Failed"}
            </span>
          </div>
          {state.error === "TTS not configured" && (
            <span className="text-[9px] text-muted-foreground max-w-[100px]">
              Add LOVABLE_API_KEY to .env
            </span>
          )}
        </div>
      )}
    </div>
  );
}
