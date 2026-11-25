import { EventsQueueView } from "@/components/EventsQueueView";

export function NeedToInvestigatePage() {
  return (
    <EventsQueueView
      title="Need To Investigate"
      description="High-priority alerts awaiting operator inspection and triage."
      statusFilter="NEED_TO_INVESTIGATE"
      nextStatusAction={{ label: "Move to Cleaning", targetStatus: "CLEANING" }}
    />
  );
}
