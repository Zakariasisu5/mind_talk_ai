import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { LANGUAGES, type LangCode } from "@/lib/speech";

interface LanguageSelectorProps {
  value: LangCode;
  onChange: (language: LangCode) => void;
  className?: string;
  showLabel?: boolean;
}

const LANG_STORAGE_KEY = "mindtalkai.language";

/**
 * Language Selector Component
 * Allows users to choose their preferred language for MindTalk AI
 */
export function LanguageSelector({ 
  value, 
  onChange, 
  className = "",
  showLabel = true 
}: LanguageSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="size-4 text-muted-foreground" />
      {showLabel && (
        <label htmlFor="language-select" className="text-sm font-medium">
          Language:
        </label>
      )}
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value as LangCode)}
        className="tap rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
            {!lang.nativeVoice && " *"}
          </option>
        ))}
      </select>
      {LANGUAGES.find(l => l.code === value && !l.nativeVoice) && (
        <span className="text-xs text-muted-foreground">
          * Limited voice support
        </span>
      )}
    </div>
  );
}

/**
 * Hook to manage language preference with localStorage persistence
 */
export function useLanguagePreference(defaultLang: LangCode = "en"): [LangCode, (lang: LangCode) => void] {
  const [language, setLanguageState] = useState<LangCode>(defaultLang);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY) as LangCode | null;
      if (stored && LANGUAGES.some(l => l.code === stored)) {
        setLanguageState(stored);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Save to localStorage when changed
  const setLanguage = (lang: LangCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Storage unavailable
    }
  };

  return [language, setLanguage];
}

/**
 * Compact language badge
 */
export function LanguageBadge({ language }: { language: LangCode }) {
  const lang = LANGUAGES.find(l => l.code === language);
  if (!lang) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
      <Globe className="size-3" />
      {lang.label}
    </span>
  );
}

/**
 * Language grid selector (for settings page)
 */
export function LanguageGrid({ 
  value, 
  onChange 
}: { 
  value: LangCode; 
  onChange: (lang: LangCode) => void 
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`tap relative rounded-2xl border-2 p-4 text-left transition-all ${
            value === lang.code
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{lang.label}</span>
            {value === lang.code && (
              <div className="size-2 rounded-full bg-primary" />
            )}
          </div>
          {!lang.nativeVoice && (
            <span className="mt-1 text-xs text-muted-foreground">
              Limited voice
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
