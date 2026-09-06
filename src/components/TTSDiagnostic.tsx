import { useState } from "react";
import { useSpeech } from "@/lib/speech";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2, Volume2 } from "lucide-react";

/**
 * Diagnostic component to test TTS functionality
 * Add this temporarily to any page to test if TTS is working
 * 
 * Usage:
 * import { TTSDiagnostic } from "@/components/TTSDiagnostic";
 * 
 * // In your component:
 * <TTSDiagnostic />
 */
export function TTSDiagnostic() {
  const { speak, stop, speakingId, muted } = useSpeech();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const testTTS = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Test 1: Check if muted
      if (muted) {
        setResult({
          success: false,
          message: "Audio is muted",
          details: "Toggle the mute button in the chat interface to enable audio",
        });
        setTesting(false);
        return;
      }

      // Test 2: Try to call the TTS API directly
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Testing text to speech functionality" }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setResult({
          success: false,
          message: `TTS API Error (${response.status})`,
          details: errorText || "Check if LOVABLE_API_KEY is set in .env file",
        });
        setTesting(false);
        return;
      }

      // Test 3: Try to play audio
      await speak("Testing text to speech functionality", { id: "diagnostic-test" });

      // Wait a bit to see if audio starts
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (speakingId === "diagnostic-test") {
        setResult({
          success: true,
          message: "TTS is working!",
          details: "Audio should be playing now. If you can't hear it, check your device volume.",
        });
      } else {
        setResult({
          success: false,
          message: "TTS failed silently",
          details: "API responded but audio didn't start. Check browser console for errors.",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "TTS test failed",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setTesting(false);
    }
  };

  const stopTest = () => {
    stop();
    setResult(null);
  };

  return (
    <div className="soft-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">TTS Diagnostics</h3>
        <Volume2 className="size-4 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-20">Muted:</span>
            <span className={muted ? "text-destructive" : "text-green-600"}>
              {muted ? "Yes (unmute to test)" : "No"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20">Playing:</span>
            <span>{speakingId || "Nothing"}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={testTTS}
            disabled={testing || speakingId === "diagnostic-test"}
            size="sm"
            className="flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="size-3 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              "Test TTS"
            )}
          </Button>
          {speakingId === "diagnostic-test" && (
            <Button onClick={stopTest} size="sm" variant="outline">
              Stop
            </Button>
          )}
        </div>
      </div>

      {result && (
        <div
          className={`rounded-lg p-3 text-xs space-y-1 ${
            result.success
              ? "bg-green-50 text-green-900 border border-green-200"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="size-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">{result.message}</p>
              {result.details && (
                <p className="text-[11px] opacity-80">{result.details}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-[10px] text-muted-foreground border-t pt-2">
        <p className="font-semibold mb-1">Quick Setup:</p>
        <ol className="list-decimal list-inside space-y-0.5 ml-1">
          <li>Add LOVABLE_API_KEY to .env file</li>
          <li>Restart dev server (npm run dev)</li>
          <li>Refresh this page</li>
          <li>Click "Test TTS" button above</li>
        </ol>
      </div>
    </div>
  );
}
