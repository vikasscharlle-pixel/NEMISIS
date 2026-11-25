
export interface OverviewStats {
  total_detections: number;
  todays_detections: number;
  weekly_detections: number;
  most_detected_object: string;
  average_confidence: number;
}

export interface DetectionTrendItem {
  date: string;
  count: number;
}

export interface DetectionTrendResponse {
  trend: DetectionTrendItem[];
}

export interface ObjectDistributionItem {
  object_class: string;
  count: number;
}

export interface ObjectDistributionResponse {
  distribution: ObjectDistributionItem[];
}
