ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS ai_analyses_used smallint DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS ai_analyses_reset_at timestamptz DEFAULT now() NOT NULL;
