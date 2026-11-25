import { EventsQueueView } from "@/components/EventsQueueView";

export function ClearedEventsPage() {
  return (
    <EventsQueueView
      title="Cleared Events"
      description="Completed and resolved surveillance records archived for audit."
      statusFilter="CLEARED"
    />
  );
}
