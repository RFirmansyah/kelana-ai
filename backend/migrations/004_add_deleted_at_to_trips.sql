-- Migration: 004_add_deleted_at_to_trips
-- Adds a deleted_at timestamp to support soft-deleting trips.
-- A NULL value means the trip is active; a non-NULL value means it was
-- "deleted" (hidden from all normal queries) at that timestamp.

ALTER TABLE trips
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS ix_trips_deleted_at ON trips (deleted_at);
