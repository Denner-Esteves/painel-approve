-- Add external_url column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_url TEXT;
