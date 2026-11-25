import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { getClassColor } from "@/lib/detectionDraw";
import type { DetectionListResponse } from "@/types/detection";

const SOURCE_TYPES = ["", "image", "video"];
const CLASSES = [
  "", "person", "bag", "backpack", "suitcase",
  "car", "motorcycle", "bicycle", "trash can",
];

export function DetectionHistoryPage() {
  const [classFilter, setClassFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["detections", classFilter, sourceFilter],
    queryFn: async () => {
      const params: Record<string, string> = { limit: "200" };
      if (classFilter) params.detection_class = classFilter;
      if (sourceFilter) params.source_type = sourceFilter;
      const res = await api.get<DetectionListResponse>("/detect/detections", { params });
      return res.data;
    },
  });

  const items = (data?.items ?? []).filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.detection_class.toLowerCase().includes(q) ||
      d.source_path.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detection History</h1>
          <p className="text-sm text-muted-foreground">
            All YOLOv11 bounding-box results stored from image and video uploads.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Class filter */}
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-slate-950/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {CLASSES.map((c) => (
            <option key={c} value={c}>{c === "" ? "All Classes" : c}</option>
          ))}
        </select>

        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-slate-950/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SOURCE_TYPES.map((s) => (
            <option key={s} value={s}>{s === "" ? "All Sources" : s}</option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class or file path..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats summary */}
      {data && (
        <div className="flex flex-wrap gap-3">
          <Badge variant="info">{data.total} Total Detections</Badge>
          <Badge variant="neutral">{items.length} Matching Filter</Badge>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detection Records</CardTitle>
          <CardDescription>Each row is one bounding box from YOLO inference</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Bounding Box</TableHead>
                <TableHead>Source Type</TableHead>
                <TableHead>Frame</TableHead>
                <TableHead>Detected At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading detection history...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No detections found. Upload an image or video to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((det) => (
                  <TableRow key={det.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{det.id}</TableCell>
                    <TableCell>
                      <span
                        className="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: `${getClassColor(det.detection_class)}22`,
                          color: getClassColor(det.detection_class),
                          border: `1px solid ${getClassColor(det.detection_class)}44`,
                        }}
                      >
                        {det.detection_class}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          det.confidence >= 0.9
                            ? "font-semibold text-emerald-400"
                            : det.confidence >= 0.75
                              ? "text-amber-300"
                              : "text-muted-foreground"
                        }
                      >
                        {(det.confidence * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      ({det.bounding_box.x1},{det.bounding_box.y1})→({det.bounding_box.x2},{det.bounding_box.y2})
                    </TableCell>
                    <TableCell>
                      <Badge variant={det.source_type === "image" ? "info" : "warning"}>
                        {det.source_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {det.frame_index != null ? `#${det.frame_index}` : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(det.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
