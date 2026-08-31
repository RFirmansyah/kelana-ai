-- Migration: 003_add_days_to_trips
-- Ensures the days column exists on the trips table.
-- (Safe to run even if the column was already added manually.)

ALTER TABLE trips
    ADD COLUMN IF NOT EXISTS days INTEGER;
