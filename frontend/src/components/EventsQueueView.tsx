import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, X } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { MOCK_EVENTS } from "@/data/mockData";
import { api } from "@/lib/api";
import type { EventListResponse, EventStatus, SurveillanceEvent } from "@/types";

interface EventsQueueViewProps {
  title: string;
  description: string;
  statusFilter: EventStatus;
  nextStatusAction?: {
    label: string;
    targetStatus: EventStatus;
  };
}

export function EventsQueueView({
  title,
  description,
  statusFilter,
  nextStatusAction,
}: EventsQueueViewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const canModify = user?.role === "Admin" || user?.role === "Operator";

  const eventsQuery = useQuery({
    queryKey: ["events", statusFilter, search],
    queryFn: async () => {
      try {
        const res = await api.get<EventListResponse>("/events", {
          params: { status: statusFilter, search: search || undefined, limit: 100 },
        });
        return res.data;
      } catch {
        const filtered = MOCK_EVENTS.filter((e) => e.status === statusFilter);
        return { items: filtered, total: filtered.length };
      }
    },
  });

  const detailQuery = useQuery({
    queryKey: ["event-detail", selectedEventId],
    enabled: selectedEventId !== null,
    queryFn: async () => {
      const res = await api.get<SurveillanceEvent>(`/events/${selectedEventId}`);
      return res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: EventStatus }) => {
      await api.patch(`/events/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setSelectedEventId(null);
    },
  });

  const events = eventsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search type or location..."
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Queue Records</CardTitle>
            <CardDescription>{events.length} event(s) matching current filter</CardDescription>
          </div>
          <Badge variant="info">{statusFilter}</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Camera Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Anomaly</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    {eventsQuery.isLoading ? "Loading events..." : "No events found in this queue."}
                  </TableCell>
                </TableRow>
              ) : (
                events.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{ev.id}</TableCell>
                    <TableCell className="font-medium">{ev.type}</TableCell>
                    <TableCell className="text-muted-foreground">{ev.camera_location ?? "Camera-01"}</TableCell>
                    <TableCell>
                      <StatusBadge status={ev.status} />
                    </TableCell>
                    <TableCell>{Math.round(ev.confidence * 100)}%</TableCell>
                    <TableCell>
                      <span
                        className={
                          ev.anomaly_score >= 0.75
                            ? "font-semibold text-red-400"
                            : ev.anomaly_score >= 0.5
                              ? "font-semibold text-amber-300"
                              : "text-emerald-300"
                        }
                      >
                        {ev.anomaly_score.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(ev.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedEventId(ev.id)}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Inspect
                        </Button>
                        {canModify && nextStatusAction && (
                          <Button
                            size="sm"
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate({ id: ev.id, status: nextStatusAction.targetStatus })
                            }
                          >
                            {nextStatusAction.label}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      {selectedEventId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <Card className="w-full max-w-xl border-border bg-slate-950">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Event #{selectedEventId} Details</CardTitle>
                <CardDescription>Phase 1 investigation record &amp; evidence placeholders</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedEventId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading event metadata...</p>
              ) : detailQuery.data ? (
                <>
                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-slate-900/60 p-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="font-medium">{detailQuery.data.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="mt-1">
                        <StatusBadge status={detailQuery.data.status} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                      <div>{Math.round(detailQuery.data.confidence * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Anomaly Score</div>
                      <div>{detailQuery.data.anomaly_score.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300">
                    <span className="block text-xs font-semibold uppercase text-muted-foreground">Summary</span>
                    {detailQuery.data.description ?? "No description available."}
                  </div>
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold uppercase text-muted-foreground">
                      Linked Evidence ({detailQuery.data.evidence_items?.length ?? 0})
                    </span>
                    {detailQuery.data.evidence_items?.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border bg-slate-900/40 p-3 text-xs">
                        <div className="font-medium text-foreground">{item.description}</div>
                        <div className="mt-1 text-muted-foreground">
                          Snapshot: {item.image_url ?? "N/A"} | Clip: {item.video_url ?? "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-red-400">Could not load event details from backend.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
