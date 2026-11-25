# NEMESIS-X

> Open-World Video Intelligence Platform for Smart Surveillance, Anomaly Detection, Ownership Reasoning, and Automated Investigation Workflows.

---

# 🚀 Overview

NEMESIS-X is an AI-powered surveillance intelligence system designed to monitor video streams, understand events over time, detect abnormal activities, and assist operators in investigating incidents.

Unlike conventional CCTV systems that merely record footage, NEMESIS-X continuously analyzes scenes, tracks people and objects, maintains temporal memory, reasons about object ownership, detects unusual behavior, and provides explainable AI-generated reports.

The platform is designed for:

- Smart Cities
- Railway Stations
- Airports
- Universities
- Industrial Plants
- Malls
- Public Infrastructure
- Corporate Campuses

---

# 🎯 Problem Statement

Traditional surveillance systems produce thousands of hours of video but require human operators to manually search for incidents.

Challenges:

- Lost or abandoned objects
- Theft and suspicious activities
- Object disposal and retrieval
- Large-scale monitoring
- Too many false alerts
- Lack of event understanding
- No explainable decision system

NEMESIS-X solves these problems through AI-based event understanding.

---

# ✨ Key Features

## Open-World Event Detection

Detect both known and unknown events.

Examples:

- Theft
- Pickpocketing
- Assault
- Suspicious movement
- Object abandonment
- Dustbin retrieval
- Novel behaviors

---

## Multi-Object Tracking

Track:

- People
- Bags
- Vehicles
- Packages
- Luggage
- Equipment

Across long durations.

---

## Ownership Memory

The system remembers:

- Who brought an object
- When it was placed
- Where it was placed

This helps distinguish:

✅ Normal behavior

from

❌ Suspicious behavior

---

## Dustbin Intelligence

Detect:

- Object deposited into dustbin
- Object retrieval from dustbin
- Waiting duration
- Disposal status

---

## Event State Machine

Every incident passes through predefined states.

```text
USUAL
↓
WAITING
↓
NEED TO INVESTIGATE
↓
TRASH
↓
CLEANING
↓
CLEARED

AI Generated Explanations

Example:

Person #12 deposited a backpack near Gate B.

The object remained unattended for 15 minutes.

A different individual approached and removed the object.

Risk Level: High

Suggested Classification:
Potential Theft

🏗️ System Architecture
Video Input
      │
      ▼
Object Detection
      │
      ▼
Object Tracking
      │
      ▼
Ownership Memory
      │
      ▼
Temporal Memory
      │
      ▼
Interaction Analysis
      │
      ▼
Anomaly Detection
      │
      ▼
Reasoning Engine
      │
      ▼
State Classification
      │
      ▼
Evidence Generator
      │
      ▼
Operator Dashboard

🧠 AI Models
Detection
Grounding DINO
YOLO World
OWL-ViT

Purpose:

Detect objects without fixed classes.

Segmentation
SAM2

Purpose:

Accurate object masking.

Tracking
ByteTrack
BoT-SORT
OC-SORT

Purpose:

Long-term object identities.

Re-Identification
OSNet
FastReID

Purpose:

Track same individual after disappearance.

Action Recognition
VideoMAE
InternVideo

Purpose:

Recognize human activities.

Scene Understanding
CLIP
SigLIP

Purpose:

Environmental context understanding.

Vision-Language Reasoning
Qwen 2.5 VL
InternVL
LLaVA

Purpose:

Generate explanations and reports.

🗄 Database Structure
Users
id
name
email
password
role
created_at

Videos
id
camera_id
source
duration
status
created_at

Tracks
track_id
video_id
entity_type
start_frame
end_frame

Objects
object_id
class_name
status
first_seen
last_seen

OwnershipLinks
id
object_id
owner_id
assigned_at
reclaimed_at

DustbinEvents
id
object_id
dustbin_id
deposited_at
retrieved_at

Events
id
event_type
status
confidence
risk_score
anomaly_score

Evidence
id
event_id
image_path
video_path
description

ClearanceLogs
id
event_id
cleared_by
reason
timestamp

👥 User Roles
Admin

Full permissions.

Capabilities:

Manage users
Configure AI
Add cameras
Access reports
View system metrics
Operator

Investigation permissions.

Capabilities:

View alerts
Classify incidents
Move events
Clear incidents
Viewer

Read-only permissions.

Capabilities:

Dashboard viewing
Report viewing
Historical event access
📺 Dashboard Modules
Main Dashboard

Cards:

Active Alerts
Need To Investigate
Waiting Queue
Cleaning Queue
Cleared Events
Auto Cleared Events
Detection Accuracy
System Health
Investigation Center

Features:

Video Playback
Event Timeline
Evidence
AI Explanation
Risk Score

Actions:

Mark Trash
Assign
Escalate
Clear
Waiting Queue

Displays:

Dustbin items
Waiting duration
Auto-clear timers
Cleaning Queue

Displays:

Trash incidents
Cleaning assignments
Completion progress
Cleared Events

Displays:

Historical investigations
Operator actions
Resolution reports
🔑 Authentication

Authentication Method:

JWT

Features:

Secure login
Role-based permissions
Session validation
Token refresh
🔌 API Endpoints
Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout

Dashboard
GET /api/dashboard/stats
GET /api/dashboard/charts

Events
GET /api/events
GET /api/events/:id
PATCH /api/events/:id/status

Waiting Queue
GET /api/waiting

Cleaning Queue
GET /api/cleaning
PATCH /api/cleaning/:id

Reports
GET /api/reports

🎨 Frontend Stack

Framework:

React 18
Vite
TypeScript
TailwindCSS


Libraries:

React Router
Axios
Recharts
React Query
ShadCN UI

⚙ Backend Stack

Framework:

FastAPI


Libraries:

SQLAlchemy
Pydantic
Alembic
Redis
PyJWT
OpenCV

🐳 Deployment

Infrastructure:

Docker
Docker Compose
Nginx
PostgreSQL
Redis


Production:

Ubuntu Server
NVIDIA GPU
CUDA

📂 Project Structure
nemesis-x/

├── frontend/
│
├── backend/
│
├── ai-engine/
│
├── database/
│
├── docker/
│
├── nginx/
│
├── docs/
│
├── scripts/
│
├── tests/
│
├── uploads/
│
├── evidence/
│
└── README.md

🚦 Development Roadmap
Phase 1

Detection + Tracking

Phase 2

Ownership Engine

Phase 3

Dustbin Intelligence

Phase 4

Anomaly Detection

Phase 5

Reasoning Engine

Phase 6

Operator Dashboard

Phase 7

Reports & Analytics

Phase 8

Production Deployment

📊 Success Metrics

Measure:

Detection Accuracy
Tracking Accuracy
Ownership Accuracy
Event Classification Accuracy
False Positive Rate
Auto-Clear Rate
Investigation Resolution Time
Novel Event Detection Rate
🔥 Unique Selling Points

✅ Open-World Intelligence

✅ Ownership Reasoning

✅ Dustbin Intelligence Workflow

✅ Temporal Memory

✅ Explainable AI

✅ Novel Event Detection

✅ Evidence-Based Investigation

✅ End-to-End Incident Lifecycle Management

✅ Smart City Ready Architecture

License

MIT License

Developed By

NEMESIS-X Team

"Understanding Events That Have Never Been Seen Before."
