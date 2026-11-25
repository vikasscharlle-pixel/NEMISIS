# NEMESIS-X Phase 1 Architecture

Phase 1 delivers the enterprise foundation for NEMESIS-X without AI inference engines (detection, tracking, ownership, dustbin, anomaly, and VLM engines are deferred to later phases).

## Repository Layout

```text
NEMISIS/
├── frontend/          # React 18 + Vite + TypeScript + Tailwind + ShadCN UI + Recharts
├── backend/           # FastAPI (controllers, services, models, schemas, routes, middleware, database)
├── database/          # PostgreSQL init SQL & schema reference
├── docker/            # Dockerfiles, Nginx config, and docker-compose.yml
├── docs/              # Architecture, API reference, and installation instructions
├── uploads/           # Video upload storage directory
└── evidence/          # Evidence snapshot/clip storage directory
```

## Backend Layering

- `routes/`: HTTP endpoint routing, query/path validation, and RBAC dependencies.
- `controllers/`: Thin request-to-service delegation layer.
- `services/`: Business logic, database queries, aggregation, and JWT workflows.
- `models/`: SQLAlchemy 2.0 ORM entities (`User`, `Video`, `Event`, `Evidence`).
- `schemas/`: Pydantic v2 request/response contracts.
- `middleware/`: JWT Bearer verification, RBAC role guards, and request timing logs.
- `database/`: SQLAlchemy engine/session setup and declarative `Base`.

## Authentication & RBAC

- **JWT**: Access and refresh tokens signed via `HS256` using `PyJWT` and `bcrypt` password hashing.
- **Roles**:
  - `Admin`: Full access including `GET /users` and `POST /users`.
  - `Operator`: Dashboard, event inspection, status transitions (`PATCH /events/{id}/status`), and reports.
  - `Viewer`: Read-only access to dashboard, events, and reports.
