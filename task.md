Dude, for Antigravity, a TASK.md is actually more useful than README because it tells the AI exactly what to build, in what order, and what is considered "done".

TASK.md
# NEMESIS-X DEVELOPMENT TASKS

Project: NEMESIS-X
Version: v1.0
Status: Development

---

# PROJECT GOAL

Build an Open-World Video Intelligence Platform that detects, tracks, reasons about, investigates, and explains unusual events from video streams.

The system must provide:

- Object Detection
- Person Tracking
- Ownership Reasoning
- Dustbin Intelligence
- Anomaly Detection
- Event Investigation
- AI Explanations
- Operator Dashboard

---

# PHASE 1
# PROJECT INITIALIZATION

## TASK-001

Create project structure.

### Acceptance Criteria

- frontend folder created
- backend folder created
- ai-engine folder created
- database folder created
- docs folder created
- docker folder created

### Status

Pending

---

## TASK-002

Initialize React frontend.

### Requirements

Install:

- React
- Vite
- TailwindCSS
- React Router
- Axios
- Recharts

### Acceptance Criteria

Frontend starts successfully.

### Status

Pending

---

## TASK-003

Initialize FastAPI backend.

### Requirements

Install:

- FastAPI
- SQLAlchemy
- Alembic
- Redis
- JWT

### Acceptance Criteria

Backend starts successfully.

### Status

Pending

---

# PHASE 2
# AUTHENTICATION SYSTEM

## TASK-004

Implement login system.

### Requirements

- JWT Authentication
- Access Token
- Refresh Token

### Acceptance Criteria

User can login.

### Status

Pending

---

## TASK-005

Implement Role Management.

### Roles

- Admin
- Operator
- Viewer

### Acceptance Criteria

Role-based access works.

### Status

Pending

---

# PHASE 3
# DATABASE DESIGN

## TASK-006

Create Users Table.

Fields:

- id
- name
- email
- password
- role

### Status

Pending

---

## TASK-007

Create Videos Table.

Fields:

- id
- source
- duration
- status

### Status

Pending

---

## TASK-008

Create Tracks Table.

Fields:

- track_id
- video_id
- entity_type

### Status

Pending

---

## TASK-009

Create Objects Table.

Fields:

- object_id
- class_name
- status

### Status

Pending

---

## TASK-010

Create OwnershipLinks Table.

Fields:

- object_id
- owner_id
- timestamp

### Status

Pending

---

## TASK-011

Create DustbinEvents Table.

Fields:

- object_id
- deposited_at
- retrieved_at

### Status

Pending

---

## TASK-012

Create Events Table.

Fields:

- event_id
- event_type
- status
- anomaly_score

### Status

Pending

---

## TASK-013

Create Evidence Table.

Fields:

- event_id
- image_path
- video_path
- description

### Status

Pending

---

## TASK-014

Create ClearanceLogs Table.

Fields:

- event_id
- cleared_by
- reason

### Status

Pending

---

# PHASE 4
# AI DETECTION ENGINE

## TASK-015

Integrate YOLO World.

### Objectives

Detect:

- Person
- Bag
- Backpack
- Vehicle
- Package
- Dustbin

### Acceptance Criteria

Detections returned via API.

### Status

Pending

---

## TASK-016

Integrate SAM2 Segmentation.

### Acceptance Criteria

Object masks generated.

### Status

Pending

---

## TASK-017

Integrate Grounding DINO.

### Acceptance Criteria

Open vocabulary detection works.

### Status

Pending

---

# PHASE 5
# TRACKING ENGINE

## TASK-018

Implement ByteTrack.

### Acceptance Criteria

Objects maintain tracking IDs.

### Status

Pending

---

## TASK-019

Implement Re-Identification.

### Requirements

Use:

- FastReID
- OSNet

### Acceptance Criteria

Identity recovery works.

### Status

Pending

---

# PHASE 6
# OWNERSHIP ENGINE

## TASK-020

Create Ownership Memory Service.

### Responsibilities

Store:

- owner
- object
- timestamp
- location

### Status

Pending

---

## TASK-021

Implement Object Return Logic.

### Rules

If owner returns:

status = USUAL

### Acceptance Criteria

Object correctly reclaimed.

### Status

Pending

---

## TASK-022

Implement Wrong Person Retrieval Logic.

### Rules

If another person takes object:

status = NEED_TO_INVESTIGATE

### Acceptance Criteria

Potential theft generated.

### Status

Pending

---

# PHASE 7
# DUSTBIN INTELLIGENCE

## TASK-023

Create Dustbin Detection Module.

### Requirements

Identify dustbin zones.

### Status

Pending

---

## TASK-024

Implement Waiting State.

### Trigger

Object enters dustbin.

### Action

Move event to WAITING.

### Status

Pending

---

## TASK-025

Implement Auto Clear Logic.

### Trigger

Waiting threshold reached.

### Action

Move event to CLEARED.

### Status

Pending

---

## TASK-026

Implement Retrieval Detection.

### Trigger

Object removed from dustbin.

### Action

Move event to NEED_TO_INVESTIGATE.

### Status

Pending

---

# PHASE 8
# ANOMALY ENGINE

## TASK-027

Implement Reconstruction Anomaly Detection.

### Model

Video Autoencoder

### Status

Pending

---

## TASK-028

Implement Prediction Anomaly Detection.

### Status

Pending

---

## TASK-029

Implement OOD Detection.

### Status

Pending

---

## TASK-030

Implement Score Fusion Layer.

### Status

Pending

---

# PHASE 9
# EVENT STATE MACHINE

## TASK-031

Implement Event Lifecycle.

States:

- USUAL
- NEED_TO_INVESTIGATE
- WAITING
- TRASH
- CLEANING
- CLEARED

### Status

Pending

---

# PHASE 10
# AI REASONING ENGINE

## TASK-032

Integrate Qwen 2.5 VL.

### Responsibilities

- Event Reasoning
- Timeline Understanding
- Explanation Generation

### Status

Pending

---

## TASK-033

Generate AI Reports.

Output:

- Summary
- Timeline
- Risk Score
- Recommendation

### Status

Pending

---

# PHASE 11
# DASHBOARD DEVELOPMENT

## TASK-034

Create Main Dashboard.

Cards:

- Active Alerts
- Waiting
- Cleaning
- Cleared

### Status

Pending

---

## TASK-035

Create Investigation Page.

Features:

- Video Playback
- Evidence
- Timeline
- AI Report

### Status

Pending

---

## TASK-036

Create Waiting Queue.

### Status

Pending

---

## TASK-037

Create Cleaning Queue.

### Status

Pending

---

## TASK-038

Create Cleared Events Page.

### Status

Pending

---

# PHASE 12
# REPORTING

## TASK-039

Create Analytics Dashboard.

Metrics:

- Detection Accuracy
- Tracking Accuracy
- Clearance Rate
- Investigation Rate

### Status

Pending

---

## TASK-040

Generate Incident Reports.

Formats:

- PDF
- CSV
- JSON

### Status

Pending

---

# PHASE 13
# DEPLOYMENT

## TASK-041

Create Docker Containers.

Services:

- Frontend
- Backend
- PostgreSQL
- Redis

### Status

Pending

---

## TASK-042

Create Docker Compose.

### Status

Pending

---

## TASK-043

Production Deployment.

Targets:

- Ubuntu
- NVIDIA GPU
- CUDA

### Status

Pending

---

# PHASE 14
# TESTING

## TASK-044

Backend Testing.

### Status

Pending

---

## TASK-045

Frontend Testing.

### Status

Pending

---

## TASK-046

AI Engine Testing.

### Status

Pending

---

## TASK-047

End-to-End Testing.

### Status

Pending

---

# FINAL DELIVERABLES

- Complete React Frontend
- Complete FastAPI Backend
- PostgreSQL Database
- Redis Cache
- Detection Engine
- Tracking Engine
- Ownership Engine
- Dustbin Intelligence
- Anomaly Engine
- AI Reasoning Engine
- Dashboard
- Reports
- Docker Deployment
- Documentation

---

# PROJECT COMPLETION CRITERIA

The project is considered complete when:

✅ Objects are detected

✅ Objects are tracked

✅ Ownership is remembered

✅ Dustbin workflow works

✅ Alerts generated correctly

✅ Event lifecycle functions correctly

✅ AI explanations generated

✅ Dashboard operational

✅ Reports generated

✅ Production deployment successful
