
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import type {
  OverviewStats,
  DetectionTrendResponse,
  ObjectDistributionResponse,
} from "@/types/analytics";

export default function AnalyticsPage() {
  const { data: overview } = useQuery<OverviewStats>({
    queryKey: ["analytics", "overview"],
    queryFn: () =>
      api.get("/analytics/overview").then((res) => res.data),
  });

  const { data: trends } = useQuery<DetectionTrendResponse>({
    queryKey: ["analytics", "trends"],
    queryFn: () =>
      api.get("/analytics/trends").then((res) => res.data),
  });

  const { data: objects } = useQuery<ObjectDistributionResponse>({
    queryKey: ["analytics", "objects"],
    queryFn: () =>
      api.get("/analytics/objects").then((res) => res.data),
  });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Detections" value={overview?.total_detections?.toString() || "-"} />
        <StatCard title="Today's Detections" value={overview?.todays_detections?.toString() || "-"} />
        <StatCard title="Weekly Detections" value={overview?.weekly_detections?.toString() || "-"} />
        <StatCard title="Most Detected Object" value={overview?.most_detected_object || "-"} />
        <StatCard title="Avg Confidence" value={overview?.average_confidence?.toFixed(2) || "-"} />
      </div>

      {trends && (
        <Card>
          <CardHeader>
            <CardTitle>Detection Trend (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.trend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {objects && (
        <Card>
          <CardHeader>
            <CardTitle>Object Distribution (top 10)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={objects.distribution} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="object_class" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
