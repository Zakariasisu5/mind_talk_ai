# MindTalk AI

A mobile-first AI health companion that helps you monitor physical and mental well-being through voice logging, symptom tracking, mood monitoring, nutrition logging, cognitive games, and real-time AI insights — all in one privacy-first platform.

**Live App:** [mindtalkai.vercel.app](https://mindtalkai.vercel.app)

---

## What it does

MindTalk AI is designed as a personal wellness assistant you can keep in your pocket. It prioritizes a clean, thumb-friendly mobile experience and scales up gracefully to desktop.

### Core Features

- **Unified Dashboard** — A single glance at recent voice logs, symptoms, mood entries, and AI insights
- **Voice Health Logger** — Record a voice note in multiple languages, get it transcribed with Khaya AI, and receive structured AI wellness feedback
- **Symptom Tracker** — Log symptoms with severity, body area, duration, and notes
- **Mood & Mental Health** — Track mood, energy, stress, anxiety, sleep quality, and visualize trends over time
- **Nutrition Logging** — Log meals with type, food items, calories, and notes
- **Interactive Body Map** — Tap body regions (heart, lungs, stomach, head, eyes) to see metrics and AI suggestions
- **AI Health Coach** — A conversational wellness assistant powered by Google Gemini that persists chat history and always stays within general wellness guidance
- **Medical Report Upload** — Upload CSV reports, extract metrics, and generate AI wellness insights
- **Emergency Contacts** — Store personal contacts and view public emergency numbers
- **Brain Boost Buddy** — Cognitive mini-games: memory matching, math challenges, and pattern recall
- **Text-to-Speech** — Listen to your voice logs read back with browser TTS

### Supported Languages

MindTalk AI supports transcription in multiple Ghanaian languages and English via Khaya AI:
- **English (en)**
- **Twi (tw, ak)**
- **Fante (fat)**
- **Dagbani (dag, dga)**
- **Gurene (gur)**
- **Kusaal (kus, ksm)**
- **Ewe (ee)**
- **Ga (ga)**
- **Gonja (gon)**
- **Ikposo (kpo)**
- **Nzema (nic)**

---

## Tech Stack

### Frontend
- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19 + Vite 8)
- **Routing:** TanStack Router
- **Data Fetching:** TanStack Query
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend & Services
- **Database:** Supabase PostgreSQL with Row-Level Security (RLS)
- **Authentication:** Supabase Auth
- **AI Chat & Insights:** Google Gemini API (gemini-3.1-flash-lite with fallback chain)
- **Transcription:** Khaya AI (supports 13+ languages)
- **Audio Processing:** ffmpeg (local only, skipped in serverless)
- **Deployment:** Vercel (serverless functions)

### PWA Features
- **Offline Support:** Service Worker with asset caching
- **Installable:** Add to home screen on mobile devices
- **Responsive:** Mobile-first design that scales to desktop

---

## Project Structure

```
src/
├── components/          # Shared UI components (AppShell, SpeechControls, etc.)
│   └── ui/             # shadcn/ui component library
├── hooks/              # React hooks (useUser, useVoiceLogTTS, etc.)
├── integrations/       # External service integrations
│   ├── supabase/      # Supabase client, auth middleware, types
│   └── lovable/       # Error reporting
├── lib/                # Core business logic
│   ├── ai.server.ts           # AI functions (chat, insights, extraction)
│   ├── ai.config.ts           # AI model configuration
│   ├── ai.functions.ts        # AI server function exports
│   ├── khaya.server.ts        # Khaya transcription API
│   ├── audio-convert.server.ts # Audio format conversion
│   ├── transcription.server.ts # Unified transcription routing
│   └── utils.ts               # Shared utilities
├── routes/             # TanStack file-based routes
│   ├── index.tsx       # Public landing page
│   ├── auth.tsx        # Sign-in / sign-up
│   ├── __root.tsx      # Root layout and metadata
│   └── _authenticated/ # Protected app routes
│       ├── dashboard.tsx
│       ├── voice.tsx
│       ├── track.tsx
│       ├── body.tsx
│       ├── chat.tsx
│       ├── brain.tsx
│       └── profile.tsx
├── router.tsx          # Router configuration
├── start.ts            # Start app configuration
└── styles.css          # Mobile-first design system and theme tokens

supabase/
└── migrations/         # Database schema and RLS policies

public/
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline caching
├── logo.jpeg          # App logo and favicon
└── icons/             # PWA icons
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **Supabase** account for database and authentication
- **Google Gemini API** key for AI features
- **Khaya AI API** key for transcription

### 1. Clone the repository

```bash
git clone <repository-url>
cd fitmind-companion
```

### 2. Install dependencies

```bash
# Using npm
npm install

# Or using bun
bun install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vite-prefixed versions (for client-side access)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Khaya AI Transcription
KHAYA_API_KEY=your-khaya-api-key
```

> **Security:** Never commit `.env` to Git. It is listed in `.gitignore` by default. See `.env.example` for a template.

### 4. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/` to set up the database schema
3. Copy your project credentials to `.env`

### 5. Get API Keys

- **Gemini API:** [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Khaya API:** [Khaya Developer Portal](https://developer-api.khaya.ai)

### 6. Run the development server

```bash
npm run dev
# Or: bun dev
```

The app will be available at `http://localhost:3000`.

### 7. Build for production

```bash
npm run build
# Or: bun run build
```

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env` to Vercel:
   - Go to Settings → Environment Variables
   - Add each variable for Production, Preview, and Development
4. Deploy!

### Environment Variables on Vercel

Make sure to add all 8 required environment variables:
- `SUPABASE_URL`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY`
- `KHAYA_API_KEY`

---

## PWA Installation

The app is configured as a Progressive Web App:

- **manifest.json** defines the app identity, theme colors, and display mode
- **sw.js** handles basic asset caching and offline fallback
- On supported mobile browsers, you can add MindTalk AI to your home screen for a native-like experience

### Install on Mobile

1. Open the app in your mobile browser (Chrome, Safari, Edge)
2. Tap the browser menu (⋮ or Share icon)
3. Select "Add to Home Screen" or "Install"
4. Launch from your home screen like a native app

---

## Key Features Explained

### Voice Transcription with Khaya AI

MindTalk AI uses [Khaya AI](https://khaya.ai) for multi-language speech recognition:
- Supports 13+ languages including Ghanaian languages
- Automatic language detection
- High accuracy for both English and local languages
- Audio format conversion handled automatically (local) or skipped (serverless)

### AI Wellness Coach

Powered by Google Gemini with intelligent fallback chain:
1. Primary: `gemini-3.1-flash-lite` (fast, reliable)
2. Fallback: `gemini-3.5-flash` (if primary unavailable)
3. Fallback: `gemini-2.5-flash` (final fallback)

Automatic retry logic handles transient API errors (503) with 800ms delay before trying the next model.

### Text-to-Speech

Browser-native TTS using the Web Speech API:
- No API key required
- Works offline
- Reads voice logs in the user's system language
- Fallback to different voices if primary unavailable

---

## Database Schema

See `supabase/migrations/` for the complete schema. Key tables:

- **profiles** - User profile information
- **voice_logs** - Voice recordings and transcriptions
- **symptoms** - Symptom tracking with severity
- **mood_logs** - Mood and mental health tracking
- **nutrition_logs** - Meal and nutrition tracking
- **emergency_contacts** - Personal emergency contacts
- **chat_messages** - AI chat conversation history
- **medical_reports** - Uploaded health reports

All tables use Row-Level Security (RLS) to ensure users can only access their own data.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Medical Disclaimer

MindTalk AI is a wellness and health tracking application. It is **not** a substitute for professional medical advice, diagnosis, or treatment. The AI assistant provides general wellness guidance only and never diagnoses conditions or prescribes treatments.

**Emergency:** If you're experiencing a medical emergency, call emergency services immediately (911 in the US, 999 in Ghana, etc.)

---

## License

This project is proprietary. All rights reserved.

---

## Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Contact the development team
- Visit the app at [mindtalkai.vercel.app](https://mindtalkai.vercel.app)

---

Built with ❤️ for accessible healthcare and wellness tracking.
