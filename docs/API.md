# NEMESIS-X Phase 1 API Reference

Interactive OpenAPI documentation is served automatically by FastAPI:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## Authentication

Pass the JWT access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

## Endpoints

| Method | Path | Auth / Role | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | API, PostgreSQL, and Redis health status |
| `POST` | `/auth/login` | Public | Authenticate user and return access/refresh JWT tokens |
| `POST` | `/auth/register` | Public | Register a new `Viewer` account and return JWT tokens |
| `GET` | `/auth/me` | Authenticated | Return current authenticated user profile |
| `GET` | `/dashboard/stats` | Authenticated | Return KPI counts, health status, and Recharts series |
| `GET` | `/events` | Authenticated | List events with optional `status`, `event_type`, `search`, `skip`, `limit` |
| `GET` | `/events/{id}` | Authenticated | Retrieve single event details with linked evidence & video metadata |
| `PATCH` | `/events/{id}/status` | `Admin`, `Operator` | Transition event status (`USUAL`, `NEED_TO_INVESTIGATE`, `WAITING`, `TRASH`, `CLEANING`, `CLEARED`) |
| `GET` | `/reports` | Authenticated | Aggregated incident analytics and recent incident records |
| `GET` | `/users` | `Admin` | List platform users |
| `POST` | `/users` | `Admin` | Create a new user with explicit RBAC role |

## Seeded Demo Accounts

All 10 seeded users share password **`Nemesis@123`**:
- **Admin**: `admin@nemesis-x.io`
- **Operator**: `operator@nemesis-x.io`
- **Viewer**: `viewer@nemesis-x.io`
