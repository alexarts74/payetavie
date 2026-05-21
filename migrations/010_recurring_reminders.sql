ALTER TABLE reminders ADD COLUMN IF NOT EXISTS recurrence VARCHAR(20) CHECK (recurrence IN ('annuel', 'mensuel'));
