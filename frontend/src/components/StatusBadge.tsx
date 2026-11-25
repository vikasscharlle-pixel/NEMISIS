import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/types";

const STATUS_MAP: Record<EventStatus, { label: string; variant: "danger" | "warning" | "info" | "success" | "neutral" }> = {
  NEED_TO_INVESTIGATE: { label: "Need To Investigate", variant: "danger" },
  WAITING: { label: "Waiting", variant: "warning" },
  TRASH: { label: "Trash", variant: "neutral" },
  CLEANING: { label: "Cleaning", variant: "info" },
  CLEARED: { label: "Cleared", variant: "success" },
  USUAL: { label: "Usual", variant: "neutral" },
};

export function StatusBadge({ status }: { status: EventStatus }) {
  const meta = STATUS_MAP[status] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
