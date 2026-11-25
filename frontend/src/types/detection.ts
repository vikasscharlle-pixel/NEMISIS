import type { DetectionResponse } from "@/types/detection";

export type { DetectionResponse };

export interface DetectionItem {
  id: number;
  source_type: "image" | "video";
  source_path: string;
  detection_class: string;
  confidence: number;
  bounding_box: { x1: number; y1: number; x2: number; y2: number };
  frame_index?: number | null;
  video_id?: number | null;
  annotated_image_path?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ImageDetectionResponse {
  source_path: string;
  annotated_image_path?: string | null;
  detections: DetectionItem[];
  total_objects: number;
  classes_found: Record<string, number>;
  inference_time_ms: number;
  model_used: string;
}

export interface VideoDetectionResponse {
  source_path: string;
  video_id?: number | null;
  total_frames_processed: number;
  total_detections: number;
  classes_found: Record<string, number>;
  inference_time_ms: number;
  model_used: string;
  sample_annotated_path?: string | null;
}

export interface DetectionListResponse {
  items: DetectionItem[];
  total: number;
}
