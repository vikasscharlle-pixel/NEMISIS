export type UserRole = "Admin" | "Operator" | "Viewer";

export type EventStatus =
  | "USUAL"
  | "NEED_TO_INVESTIGATE"
  | "WAITING"
  | "TRASH"
  | "CLEANING"
  | "CLEARED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface EvidenceItem {
  id: number;
  event_id: number;
  image_url: string | null;
  video_url: string | null;
  description: string;
}

export interface SurveillanceEvent {
  id: number;
  type: string;
  status: EventStatus;
  confidence: number;
  anomaly_score: number;
  video_id?: number | null;
  camera_location?: string | null;
  description?: string | null;
  created_at: string;
  evidence_items?: EvidenceItem[];
}

export interface EventListResponse {
  items: SurveillanceEvent[];
  total: number;
}

export interface TrendPoint {
  date: string;
  total: number;
  investigate: number;
  cleared: number;
}

export interface DistributionSlice {
  name: string;
  value: number;
}

export interface IncidentStat {
  category: string;
  count: number;
  avg_anomaly: number;
}

export interface DashboardStats {
  total_alerts: number;
  need_to_investigate: number;
  waiting_queue: number;
  cleaning_queue: number;
  cleared_events: number;
  usual_events: number;
  system_health: string;
  database_status: string;
  redis_status: string;
  alerts_trend: TrendPoint[];
  event_distribution: DistributionSlice[];
  incident_statistics: IncidentStat[];
}

export interface ReportsResponse {
  generated_at: string;
  total_events: number;
  high_risk_count: number;
  average_confidence: number;
  average_anomaly_score: number;
  status_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  recent_incidents: Array<{
    id: number;
    type: string;
    status: EventStatus;
    confidence: number;
    anomaly_score: number;
    camera_location: string;
    created_at: string;
  }>;
}
