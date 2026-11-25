import { EventsQueueView } from "@/components/EventsQueueView";

export function CleaningPage() {
  return (
    <EventsQueueView
      title="Cleaning Queue"
      description="Confirmed trash/cleanup incidents assigned for field resolution."
      statusFilter="CLEANING"
      nextStatusAction={{ label: "Mark Cleared", targetStatus: "CLEARED" }}
    />
  );
}
