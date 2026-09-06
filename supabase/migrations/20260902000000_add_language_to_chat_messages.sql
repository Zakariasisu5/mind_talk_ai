-- Add language column to chat_messages table for multi-language support
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'tw', 'dag'));

-- Create index for faster language-based queries
CREATE INDEX IF NOT EXISTS chat_messages_language_idx ON public.chat_messages (user_id, language, created_at DESC);

-- Update existing rows to have default language
UPDATE public.chat_messages SET language = 'en' WHERE language IS NULL;
