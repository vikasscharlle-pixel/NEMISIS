# NEMESIS-X Database Schema (Phase 1)

This directory contains PostgreSQL initialization helpers for the NEMESIS-X Phase 1 foundation.
Schema migrations are managed via **Alembic** inside `backend/alembic/`.

## Tables

1. **`users`**
   - `id` (INTEGER, PK)
   - `name` (VARCHAR)
   - `email` (VARCHAR, UNIQUE, INDEXED)
   - `password_hash` (VARCHAR)
   - `role` (VARCHAR: `Admin`, `Operator`, `Viewer`)
   - `created_at` (TIMESTAMP WITH TIME ZONE)

2. **`videos`**
   - `id` (INTEGER, PK)
   - `source` (VARCHAR)
   - `duration` (FLOAT)
   - `status` (VARCHAR)
   - `created_at` (TIMESTAMP WITH TIME ZONE)

3. **`events`**
   - `id` (INTEGER, PK)
   - `type` (VARCHAR)
   - `status` (VARCHAR: `USUAL`, `NEED_TO_INVESTIGATE`, `WAITING`, `TRASH`, `CLEANING`, `CLEARED`)
   - `confidence` (FLOAT)
   - `anomaly_score` (FLOAT)
   - `video_id` (INTEGER, FK -> `videos.id`, NULLABLE)
   - `description` (TEXT, NULLABLE)
   - `camera_location` (VARCHAR, NULLABLE)
   - `created_at` (TIMESTAMP WITH TIME ZONE)

4. **`evidence`**
   - `id` (INTEGER, PK)
   - `event_id` (INTEGER, FK -> `events.id`)
   - `image_url` (VARCHAR, NULLABLE)
   - `video_url` (VARCHAR, NULLABLE)
   - `description` (TEXT)
