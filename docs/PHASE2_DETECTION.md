# Phase 2 — Object Detection (AI Engine)

This directory contains the YOLOv11 detection service and all related backend code.

## Target Classes (Phase 2)

| Class | COCO label |
|---|---|
| Person | `person` |
| Bag | `bag` |
| Backpack | `backpack` |
| Suitcase | `suitcase` |
| Car | `car` |
| Motorcycle | `motorcycle` |
| Bicycle | `bicycle` |
| Trash Can | `trash can` |

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/detect/image` | Upload an image → YOLOv11 → persist bounding boxes |
| `POST` | `/detect/video` | Upload a video → sample frames → YOLOv11 |
| `GET` | `/detect/detections` | List stored detections with class/source filters |

## Model

- **YOLOv11 Nano** (`yolo11n.pt`) is auto-downloaded by `ultralytics` on first inference call.
- If `ultralytics` is not installed the service falls back to **deterministic mock detections** so the API and DB pipeline still work during development.

## Alembic Migration

```bash
cd backend
alembic upgrade head   # applies 0002_detections_table
```

## Install Requirements

```bash
pip install -r requirements.txt
```
