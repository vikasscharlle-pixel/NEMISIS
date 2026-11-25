-- NEMESIS-X Phase 1 PostgreSQL Reference Schema
-- Note: Alembic manages schema migrations in production (backend/alembic).
-- This script ensures extensions/types are ready when PostgreSQL initializes.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
