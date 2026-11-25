import { EventsQueueView } from "@/components/EventsQueueView";

export function WaitingPage() {
  return (
    <EventsQueueView
      title="Waiting Queue"
      description="Events currently in observation or waiting timer windows."
      statusFilter="WAITING"
      nextStatusAction={{ label: "Clear Event", targetStatus: "CLEARED" }}
    />
  );
}
