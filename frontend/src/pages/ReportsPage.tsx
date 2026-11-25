import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import type { ReportsResponse } from "@/types";

export function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports-summary"],
    queryFn: async () => {
      const res = await api.get<ReportsResponse>("/reports");
      return res.data;
    },
  });

  const exportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nemesis-x-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incident Reports</h1>
          <p className="text-sm text-muted-foreground">
            Aggregated incident analytics and exportable Phase 1 audit summaries.
          </p>
        </div>
        <Button variant="outline" onClick={exportJson} disabled={!data}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
      </div>

      {isLoading || !data ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {isLoading ? "Generating report metrics..." : "Report endpoint unavailable."}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase text-muted-foreground">Total Events</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{data.total_events}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase text-muted-foreground">High Risk (&ge; 0.75)</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-red-400">{data.high_risk_count}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase text-muted-foreground">Avg Confidence</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {Math.round(data.average_confidence * 100)}%
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase text-muted-foreground">Avg Anomaly Score</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-amber-300">
                {data.average_anomaly_score.toFixed(2)}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Incident Log</CardTitle>
              <CardDescription>
                Generated at {new Date(data.generated_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Anomaly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recent_incidents.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">#{item.id}</TableCell>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell className="text-muted-foreground">{item.camera_location}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{Math.round(item.confidence * 100)}%</TableCell>
                      <TableCell>{item.anomaly_score.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
