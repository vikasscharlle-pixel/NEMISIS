# NEMESIS-X Phase 1 Installation & Run Guide

## Option 1: Docker Compose (Recommended)

Prerequisites: Docker & Docker Compose.

```bash
cd docker
docker compose up --build
```

Services started:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Docs (Swagger)**: `http://localhost:8000/docs`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

On container startup, the backend automatically runs `alembic upgrade head` and `python seed.py` (10 users, 50 events, 5 videos, 50 evidence rows).

---

## Option 2: Local Development

### 1. Backend Setup (Python 3.11+)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Ensure PostgreSQL and Redis are running and update `DATABASE_URL` / `REDIS_URL` in `backend/.env`, then run migrations and seed data:

```bash
alembic upgrade head
python seed.py
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup (Node.js 20+)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` and sign in with any seeded demo credential (e.g., `admin@nemesis-x.io` / `Nemesis@123`).

### 3. Running Backend Tests

```bash
cd backend
pytest -v
```
