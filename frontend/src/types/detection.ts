export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  id?: string;
  detection_class: string;
  class?: string;
  confidence: number;
  bounding_box: BoundingBox;
  frame_index?: number;
  source_path: string;
  source_type: string;
  created_at: string;
}

export interface ReasoningEvent {
  object: string;
  event_type: string;
  observations: number;
  duration_frames: number;
  movement_distance_pixels?: number;
  net_displacement_pixels?: number;
  direction?: string;
  confidence: number;
  explanation: string;
}

export interface ImageDetectionResponse {
  detections: Detection[];
  total_objects: number;
  total_detections?: number;
  classes_found: Record<string, number>;
  model_used: string;
  inference_time_ms: number;
  image_url?: string;
  annotated_image?: string;
}

export interface VideoDetectionResponse {
  detections: Detection[];
  total_objects?: number;
  total_detections: number;
  total_frames_processed: number;
  classes_found: Record<string, number>;
  model_used: string;
  inference_time_ms: number;
  reasoning_summary?: string;
  reasoning_events?: ReasoningEvent[];
  video_url?: string;
  annotated_video?: string;
}

export interface DetectionListResponse {
  items: Detection[];
  total: number;
  page?: number;
  limit?: number;
}

export interface DetectionResponse {
  detections: Detection[];
  total_detections?: number;
  reasoning_summary?: string;
  reasoning_events?: ReasoningEvent[];
}