"""
Phase 2 — Object Detection Service
====================================
Wraps YOLOv11 (ultralytics) to run inference on uploaded images and videos.

YOLO target classes (Phase 2):
  person, bag, backpack, suitcase, car, motorcycle, bicycle, trash can

The service:
  1. Loads the YOLO model once (singleton) on first call.
  2. Runs inference on the provided file path.
  3. Persists each detected bounding box as a Detection row in the database.
  4. Saves an annotated image (bounding-box overlay) to disk.
  5. Returns a structured summary response.

If YOLO is not installed (ultralytics not in .venv), the service falls back to
deterministic mock detections so the API still exercises the full database
and schema pipeline during development without a GPU or model download.
"""
import io
import logging
import time
import uuid
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from core.config import get_settings
from models.detection import Detection
from schemas.detection import DetectionItem, ImageDetectionResponse, VideoDetectionResponse

logger = logging.getLogger("nemesis.detection")
settings = get_settings()

# -----------------------------------------------------------------
# YOLO target labels (Phase 2 scope)
# -----------------------------------------------------------------
YOLO_TARGET_CLASSES = {
    "person",
    "bag",
    "backpack",
    "suitcase",
    "car",
    "motorcycle",
    "bicycle",
    "trash can",
}

# -----------------------------------------------------------------
# YOLO model singleton
# -----------------------------------------------------------------
_yolo_model: Optional[Any] = None
_yolo_available: bool = False
_MODEL_NAME = "yolo11n.pt"          # smallest YOLOv11 nano model (~6 MB)


def _load_yolo() -> Tuple[Optional[Any], bool]:
    """Load YOLOv11 on first call; return (model, is_available)."""
    global _yolo_model, _yolo_available
    if _yolo_model is not None:
        return _yolo_model, _yolo_available
    try:
        from ultralytics import YOLO  # type: ignore
        logger.info("Loading YOLOv11 model: %s", _MODEL_NAME)
        _yolo_model = YOLO(_MODEL_NAME)
        _yolo_available = True
        logger.info("YOLOv11 model loaded successfully.")
    except ImportError:
        logger.warning(
            "ultralytics not installed — running in MOCK detection mode. "
            "Install ultralytics: pip install ultralytics"
        )
        _yolo_available = False
    except Exception as exc:
        logger.error("Failed to load YOLO model: %s", exc)
        _yolo_available = False
    return _yolo_model, _yolo_available


# -----------------------------------------------------------------
# Directory helpers
# -----------------------------------------------------------------
def _uploads_dir() -> Path:
    return Path("uploads")


def _evidence_dir() -> Path:
    return Path("evidence")


def _ensure_dirs() -> None:
    _uploads_dir().mkdir(parents=True, exist_ok=True)
    _evidence_dir().mkdir(parents=True, exist_ok=True)


# -----------------------------------------------------------------
# Mock detection fallback (no GPU / no ultralytics)
# -----------------------------------------------------------------
import random as _rng

_MOCK_CLASSES = [
    "person", "backpack", "bag", "suitcase",
    "car", "bicycle", "motorcycle", "trash can",
]

def _mock_detections(image_width: int = 1280, image_height: int = 720) -> List[Dict]:
    """Return 2–6 deterministic mock detections for local dev without YOLO."""
    _rng.seed(42)
    out = []
    for _ in range(_rng.randint(2, 6)):
        cls = _rng.choice(_MOCK_CLASSES)
        x1 = _rng.randint(0, image_width - 100)
        y1 = _rng.randint(0, image_height - 100)
        x2 = x1 + _rng.randint(60, 200)
        y2 = y1 + _rng.randint(60, 200)
        out.append({
            "class": cls,
            "confidence": round(_rng.uniform(0.72, 0.98), 2),
            "bbox": {"x1": x1, "y1": y1, "x2": min(x2, image_width), "y2": min(y2, image_height)},
        })
    return out


# -----------------------------------------------------------------
# Drawing helpers (requires Pillow, installed as part of ultralytics)
# -----------------------------------------------------------------
_LABEL_COLORS = {
    "person":     (0, 229, 255),
    "bag":        (0, 255, 153),
    "backpack":   (0, 255, 153),
    "suitcase":   (0, 255, 153),
    "car":        (255, 200, 0),
    "motorcycle": (255, 100, 0),
    "bicycle":    (255, 100, 0),
    "trash can":  (200, 0, 255),
}
_DEFAULT_COLOR = (200, 200, 200)


def _draw_boxes(image_path: Path, detections: List[Dict], out_path: Path) -> None:
    """Draw bounding boxes on the source image and save annotated copy."""
    try:
        from PIL import Image, ImageDraw, ImageFont  # type: ignore

        img = Image.open(image_path).convert("RGB")
        draw = ImageDraw.Draw(img)

        try:
            font = ImageFont.truetype("arial.ttf", 18)
        except Exception:
            font = ImageFont.load_default()

        for det in detections:
            bb = det["bbox"]
            cls = det["class"]
            conf = det["confidence"]
            color = _LABEL_COLORS.get(cls, _DEFAULT_COLOR)
            draw.rectangle([bb["x1"], bb["y1"], bb["x2"], bb["y2"]], outline=color, width=3)
            label = f"{cls} {conf:.0%}"
            draw.text((bb["x1"] + 4, max(bb["y1"] - 20, 0)), label, fill=color, font=font)

        img.save(str(out_path))
        logger.info("Annotated image saved: %s", out_path)
    except Exception as exc:
        logger.warning("Could not draw bounding boxes (PIL error): %s", exc)
        # Copy original as fallback so API still returns a valid path
        import shutil
        shutil.copy2(image_path, out_path)


# -----------------------------------------------------------------
# Core inference wrappers
# -----------------------------------------------------------------
def _run_yolo_on_image(image_path: Path) -> List[Dict]:
    """Run YOLO inference on a single image; return list of detection dicts."""
    model, available = _load_yolo()
    if not available:
        return _mock_detections()

    results = model.predict(str(image_path), verbose=False)
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id].lower()
            if cls_name not in YOLO_TARGET_CLASSES:
                continue
            conf = float(box.conf[0])
            x1, y1, x2, y2 = (int(v) for v in box.xyxy[0])
            detections.append({
                "class": cls_name,
                "confidence": round(conf, 4),
                "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
            })
    return detections


def _run_yolo_on_video(video_path: Path, sample_every_n_frames: int = 30) -> Tuple[List[Dict], int, Optional[Path]]:
    """
    Run YOLO on a video file, sampling every N frames.
    Returns (all_detections, frames_processed, annotated_first_frame_path).
    """
    model, available = _load_yolo()
    _ensure_dirs()

    if not available:
        # Mock: pretend 60 frames, 3 detections each
        all_dets = []
        for frame_i in range(0, 60, sample_every_n_frames):
            for det in _mock_detections():
                det["frame_index"] = frame_i
                all_dets.append(det)
        return all_dets, 60 // sample_every_n_frames, None

    try:
        import cv2  # type: ignore
    except ImportError:
        logger.warning("opencv-python not installed; cannot process video frames.")
        return [], 0, None

    cap = cv2.VideoCapture(str(video_path))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    all_dets: List[Dict] = []
    frame_idx = 0
    frames_processed = 0
    sample_frame_path: Optional[Path] = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % sample_every_n_frames == 0:
            # Write temp frame for YOLO
            temp_frame = _uploads_dir() / f"_tmp_frame_{uuid.uuid4().hex}.jpg"
            cv2.imwrite(str(temp_frame), frame)
            dets = _run_yolo_on_image(temp_frame)
            for det in dets:
                det["frame_index"] = frame_idx
            all_dets.extend(dets)
            frames_processed += 1

            # Save annotated first frame as preview
            if sample_frame_path is None and dets:
                ann_name = f"annotated_frame0_{video_path.stem}_{uuid.uuid4().hex[:8]}.jpg"
                sample_frame_path = _evidence_dir() / ann_name
                _draw_boxes(temp_frame, dets, sample_frame_path)

            temp_frame.unlink(missing_ok=True)
        frame_idx += 1

    cap.release()
    return all_dets, frames_processed, sample_frame_path


# -----------------------------------------------------------------
# Public service functions called by the route layer
# -----------------------------------------------------------------
def run_image_detection(
    db: Session,
    file_bytes: bytes,
    filename: str,
) -> ImageDetectionResponse:
    """
    Save uploaded image, run YOLO, persist detections, return summary.
    """
    _ensure_dirs()
    t0 = time.perf_counter()

    # Save upload
    ext = Path(filename).suffix or ".jpg"
    unique_name = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
    image_path = _uploads_dir() / unique_name
    image_path.write_bytes(file_bytes)

    # Detect
    raw_detections = _run_yolo_on_image(image_path)

    # Draw bounding boxes and save annotated copy
    ann_name = f"annotated_{unique_name}"
    ann_path = _evidence_dir() / ann_name
    _draw_boxes(image_path, raw_detections, ann_path)

    inference_ms = (time.perf_counter() - t0) * 1000

    # Persist to database
    db_rows: List[Detection] = []
    for det in raw_detections:
        row = Detection(
            source_type="image",
            source_path=str(image_path),
            detection_class=det["class"],
            confidence=det["confidence"],
            bounding_box=det["bbox"],
            annotated_image_path=str(ann_path),
            notes=f"YOLOv11 | {filename}",
        )
        db.add(row)
        db_rows.append(row)

    db.commit()
    for row in db_rows:
        db.refresh(row)

    classes_found = dict(Counter(r.detection_class for r in db_rows))
    items = [DetectionItem.model_validate(r) for r in db_rows]

    return ImageDetectionResponse(
        source_path=str(image_path),
        annotated_image_path=str(ann_path) if raw_detections else None,
        detections=items,
        total_objects=len(items),
        classes_found=classes_found,
        inference_time_ms=round(inference_ms, 2),
        model_used=_MODEL_NAME if _yolo_available else "mock",
    )


def run_video_detection(
    db: Session,
    file_bytes: bytes,
    filename: str,
    sample_every_n_frames: int = 30,
) -> VideoDetectionResponse:
    """
    Save uploaded video, run YOLO on sampled frames, persist detections.
    """
    from models.video import Video

    _ensure_dirs()
    t0 = time.perf_counter()

    ext = Path(filename).suffix or ".mp4"
    unique_name = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
    video_path = _uploads_dir() / unique_name
    video_path.write_bytes(file_bytes)

    # Save a Video row for reference
    video_row = Video(source=str(video_path), duration=0.0, status="PROCESSING")
    db.add(video_row)
    db.flush()

    raw_detections, frames_processed, sample_ann_path = _run_yolo_on_video(
        video_path, sample_every_n_frames=sample_every_n_frames
    )

    inference_ms = (time.perf_counter() - t0) * 1000

    # Persist
    db_rows: List[Detection] = []
    for det in raw_detections:
        row = Detection(
            source_type="video",
            source_path=str(video_path),
            detection_class=det["class"],
            confidence=det["confidence"],
            bounding_box=det["bbox"],
            frame_index=det.get("frame_index"),
            video_id=video_row.id,
            annotated_image_path=str(sample_ann_path) if sample_ann_path else None,
            notes=f"YOLOv11 | {filename} | frame {det.get('frame_index', '?')}",
        )
        db.add(row)
        db_rows.append(row)

    video_row.status = "PROCESSED"
    db.commit()

    classes_found = dict(Counter(r.detection_class for r in db_rows))

    return VideoDetectionResponse(
        source_path=str(video_path),
        video_id=video_row.id,
        total_frames_processed=frames_processed,
        total_detections=len(db_rows),
        classes_found=classes_found,
        inference_time_ms=round(inference_ms, 2),
        model_used=_MODEL_NAME if _yolo_available else "mock",
        sample_annotated_path=str(sample_ann_path) if sample_ann_path else None,
    )


def list_detections(
    db: Session,
    class_filter: Optional[str] = None,
    source_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> Tuple[List[Detection], int]:
    """Return paginated detections with optional class and source-type filters."""
    query = db.query(Detection)
    if class_filter:
        query = query.filter(Detection.detection_class == class_filter.lower())
    if source_type:
        query = query.filter(Detection.source_type == source_type)
    total = query.count()
    items = query.order_by(Detection.created_at.desc(), Detection.id.desc()).offset(skip).limit(limit).all()
    return items, total
