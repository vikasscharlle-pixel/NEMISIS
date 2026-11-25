Build a complete enterprise-grade AI surveillance platform called NEMESIS-X.

TECH STACK

Frontend:
- React 18
- Vite
- TailwindCSS
- React Router
- Recharts
- Axios

Backend:
- FastAPI (Python)
- SQLAlchemy
- PostgreSQL
- Redis
- JWT Authentication

AI Layer:
- Grounding DINO
- YOLO World
- SAM2
- ByteTrack
- Qwen 2.5 VL

Deployment:
- Docker
- Docker Compose

====================================================

SYSTEM OVERVIEW

NEMESIS-X is an Open World Video Intelligence Platform.

The system must:

1. Process video streams
2. Detect people and objects
3. Track entities
4. Associate people with objects
5. Detect abandonment
6. Detect object retrieval
7. Detect dustbin deposits
8. Detect dustbin retrievals
9. Detect anomalies
10. Generate evidence
11. Generate AI explanations

====================================================

APPLICATION PAGES

1. Login Page

2. Dashboard

3. Need To Investigate

4. Waiting Queue

5. Cleaning Queue

6. Cleared Events

7. Event Viewer

8. Event Timeline

9. Users Management

10. Settings

11. Reports

====================================================

SIDEBAR MENU

Dashboard

Need To Investigate

Waiting

Cleaning

Cleared

Reports

Users

Settings

Logout

====================================================

DASHBOARD CARDS

Total Alerts

Need To Investigate

Waiting

Cleaning

Cleared

Auto Cleared

Anomaly Score

System Health

====================================================

DASHBOARD CHARTS

Alerts Trend

Status Distribution

Daily Incidents

Weekly Incidents

Monthly Incidents

Alert Types

====================================================

EVENT STATUSES

USUAL

NEED_TO_INVESTIGATE

WAITING

TRASH

CLEANING

CLEARED

====================================================

BUSINESS RULES

RULE 1

If a person leaves an object:

Store:

- ownerId
- objectId
- timestamp
- location

====================================================

RULE 2

If same person returns:

status = USUAL

====================================================

RULE 3

If different person takes object:

status = NEED_TO_INVESTIGATE

reason = POSSIBLE THEFT

====================================================

RULE 4

If object unattended beyond threshold:

status = NEED_TO_INVESTIGATE

reason = ABANDONED OBJECT

====================================================

DUSTBIN RULES

If object enters dustbin zone:

status = WAITING

start waiting timer

====================================================

If waiting exceeds threshold:

status = CLEARED

reason = NORMAL DISPOSAL

====================================================

If object removed from dustbin:

status = NEED_TO_INVESTIGATE

reason = SUSPICIOUS RECOVERY

====================================================

OPERATOR WORKFLOW

Need To Investigate

↓

Mark as Trash

↓

Cleaning

↓

Mark Completed

↓

Cleared

====================================================

DATABASE TABLES

Users

id
name
email
password
role

-----------------------------------

Videos

id
source
duration
status

-----------------------------------

Tracks

id
video_id
entity_type

-----------------------------------

Objects

id
class_name
status

-----------------------------------

OwnershipLinks

id
object_id
owner_id
created_at

-----------------------------------

DustbinEvents

id
object_id
deposited_at
retrieved_at

-----------------------------------

Events

id
event_type
status
confidence
anomaly_score

-----------------------------------

Evidence

id
event_id
description
image_url
video_url

-----------------------------------

ClearanceLogs

id
event_id
cleared_by
reason
time

====================================================

API ENDPOINTS

POST /auth/login

POST /auth/register

GET /dashboard/stats

GET /events

GET /events/:id

PATCH /events/:id/status

GET /waiting

GET /cleaning

GET /cleared

GET /reports

GET /users

POST /users

DELETE /users/:id

====================================================

FRONTEND REQUIREMENTS

Responsive Design

Dark Theme

Modern AI Dashboard UI

Use Tailwind Components

Animated Metrics

Realtime Updates

Filtering

Sorting

Searching

Pagination

Role-Based Access

====================================================

EVENT VIEWER

Show:

Video Player

Evidence Frames

AI Explanation

Timeline

Owner Information

Object Information

Anomaly Score

Confidence Score

Actions

====================================================

AI EXPLANATION FORMAT

Incident Summary

What Happened

Entities Involved

Timeline

Risk Assessment

Confidence Score

Recommended Action

====================================================

PROJECT STRUCTURE

frontend/
backend/
docker/
docs/

Generate the complete production-ready folder structure, React frontend, FastAPI backend, database models, API routes, dashboard UI, authentication system, and Docker deployment files.

Return full source code with comments and best practices.