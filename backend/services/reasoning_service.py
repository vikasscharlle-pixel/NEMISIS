
from collections import defaultdict
import math


def _get_box(detection):
    """
    Extract bounding box from supported detection formats.
    Supports:
    - bbox: [x1, y1, x2, y2]
    - bounding_box: [x1, y1, x2, y2]
    - bbox / bounding_box dictionaries
    """

    box = detection.get("bbox", detection.get("bounding_box"))

    if box is None:
        return None

    # Dictionary format
    if isinstance(box, dict):
        if all(key in box for key in ("x1", "y1", "x2", "y2")):
            return [
                box["x1"],
                box["y1"],
                box["x2"],
                box["y2"],
            ]

        return None

    # List or tuple format
    if isinstance(box, (list, tuple)) and len(box) >= 4:
        try:
            return [float(value) for value in box[:4]]
        except (ValueError, TypeError):
            return None

    return None


def analyze_video_events(detections):
    """
    Temporal reasoning with movement trajectory and directional analysis.

    Analyses bounding-box centre movement across sampled frames.
    """

    if not detections:
        return {
            "events": [],
            "reasoning_summary": (
                "No detections available for temporal analysis."
            ),
        }

    grouped = defaultdict(list)

    # --------------------------------------------------
    # Extract detections and calculate bounding-box centres
    # --------------------------------------------------

    for detection in detections:

        cls = str(
            detection.get(
                "class",
                detection.get("detection_class", "Unknown"),
            )
        )

        frame = detection.get("frame_index", 0)
        confidence = detection.get("confidence", 0)

        box = _get_box(detection)

        centre = None

        if box is not None:
            x1, y1, x2, y2 = box

            centre = (
                (x1 + x2) / 2,
                (y1 + y2) / 2,
            )

        grouped[cls].append({
            "frame": frame,
            "confidence": confidence,
            "box": box,
            "centre": centre,
        })

    events = []

    # --------------------------------------------------
    # Analyse movement for each detected object class
    # --------------------------------------------------

    for object_class, observations in grouped.items():

        observations.sort(
            key=lambda item: item["frame"]
        )

        frames = sorted(
            set(item["frame"] for item in observations)
        )

        count = len(observations)

        # Require at least 3 sampled frames
        if len(frames) < 3:
            continue

        duration_frames = frames[-1] - frames[0]

        valid_positions = [
            item
            for item in observations
            if item["centre"] is not None
        ]

        movement_distance = 0.0
        net_displacement = 0.0
        direction = "Unknown"

        # --------------------------------------------------
        # Calculate movement
        # --------------------------------------------------

        if len(valid_positions) >= 2:

            positions = [
                item["centre"]
                for item in valid_positions
            ]

            # Cumulative path distance
            for i in range(1, len(positions)):

                movement_distance += math.dist(
                    positions[i - 1],
                    positions[i],
                )

            # Start-to-end displacement
            start = positions[0]
            end = positions[-1]

            dx = end[0] - start[0]
            dy = end[1] - start[1]

            net_displacement = math.dist(
                start,
                end,
            )

            # --------------------------------------------------
            # Determine movement direction
            # --------------------------------------------------

            if net_displacement < 5:

                direction = "Minimal movement"

            else:

                angle = math.degrees(
                    math.atan2(-dy, dx)
                )

                angle = (angle + 360) % 360

                if angle >= 337.5 or angle < 22.5:
                    direction = "Right"

                elif angle < 67.5:
                    direction = "Up-Right"

                elif angle < 112.5:
                    direction = "Up"

                elif angle < 157.5:
                    direction = "Up-Left"

                elif angle < 202.5:
                    direction = "Left"

                elif angle < 247.5:
                    direction = "Down-Left"

                elif angle < 292.5:
                    direction = "Down"

                else:
                    direction = "Down-Right"

        # --------------------------------------------------
        # Movement description
        # --------------------------------------------------

        movement_label = (
            "Movement observed"
            if movement_distance > 0
            else "Limited positional change observed"
        )

        # --------------------------------------------------
        # Generate temporal event
        # --------------------------------------------------

        events.append({

            "object": object_class,

            "event_type": (
                "Movement_Trajectory_Observation"
            ),

            "observations": count,

            "duration_frames": duration_frames,

            "movement_distance_pixels": round(
                movement_distance,
                2,
            ),

            "net_displacement_pixels": round(
                net_displacement,
                2,
            ),

            "direction": direction,

            "confidence": round(
                sum(
                    item["confidence"]
                    for item in observations
                ) / count,
                3,
            ),

            "explanation": (
                f"{object_class} was observed across "
                f"{len(frames)} sampled frames. "
                f"{movement_label}. "
                f"Direction: {direction}. "
                f"Cumulative path distance: "
                f"{round(movement_distance, 2)} pixels. "
                f"Net displacement: "
                f"{round(net_displacement, 2)} pixels."
            ),
        })

    # --------------------------------------------------
    # Generate overall reasoning summary
    # --------------------------------------------------

    summary = (
        f"Temporal analysis examined "
        f"{len(detections)} detections "
        f"across {len(grouped)} object classes "
        f"and generated {len(events)} movement observations."
    )

    return {
        "events": events,
        "reasoning_summary": summary,
    }
