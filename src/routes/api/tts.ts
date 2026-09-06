import { createFileRoute } from "@tanstack/react-router";

type Body = { text?: unknown; voice?: unknown };

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (!text) return new Response("Text is required", { status: 400 });

        // Return a simple JSON response instructing the client to use browser TTS
        // This allows the app to work without Lovable API key
        return new Response(
          JSON.stringify({ 
            useBrowserTTS: true, 
            text: text.slice(0, 3500),
            message: "Using browser text-to-speech" 
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200
          }
        );
      },
    },
  },
});
