-- Migration: 006_enhance_conversations
-- Add titles and activity timestamps for conversation history.

ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS title VARCHAR(120);

ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE conversations
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE conversations
    ALTER COLUMN updated_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_user_updated_at
    ON conversations(user_id, updated_at DESC);
