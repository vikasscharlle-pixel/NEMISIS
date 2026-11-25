import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_DASHBOARD_STATS } from "@/data/mockData";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/types";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#06b6d4", "#10b981", "#64748b"];

export function DashboardPage() {
  const { data: stats = MOCK_DASHBOARD_STATS, isFetching } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        const res = await api.get<DashboardStats>("/dashboard/stats");
        return res.data;
      } catch {
        return MOCK_DASHBOARD_STATS;
      }
    },
  });

  const kpiCards = [
    {
      title: "Total Alerts",
      value: stats.total_alerts,
      subtitle: "All tracked Phase 1 incidents",
      icon: Bell,
      accent: "text-sky-400",
    },
    {
      title: "Need To Investigate",
      value: stats.need_to_investigate,
      subtitle: "Requires operator triage",
      icon: AlertTriangle,
      accent: "text-red-400",
    },
    {
      title: "Waiting Queue",
      value: stats.waiting_queue,
      subtitle: "Pending clearance timer",
      icon: Clock,
      accent: "text-amber-400",
    },
    {
      title: "Cleaning Queue",
      value: stats.cleaning_queue,
      subtitle: "Assigned trash / cleanup",
      icon: Trash2,
      accent: "text-cyan-400",
    },
    {
      title: "Cleared Events",
      value: stats.cleared_events,
      subtitle: "Resolved & archived",
      icon: CheckCircle2,
      accent: "text-emerald-400",
    },
    {
      title: "System Health",
      value: stats.system_health,
      subtitle: `DB: ${stats.database_status} | Cache: ${stats.redis_status}`,
      icon: Activity,
      accent: stats.system_health === "Healthy" ? "text-emerald-400" : "text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time overview of surveillance queues, system status, and Phase 1 mock telemetry.
          </p>
        </div>
        <Badge variant="info">{isFetching ? "Refreshing..." : "Phase 1 Foundation Active"}</Badge>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map(({ title, value, subtitle, icon: Icon, accent }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className={`h-4 w-4 ${accent}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recharts Visualizations */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Alerts Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alerts Trend (7 Days)</CardTitle>
            <CardDescription>Daily total alerts vs. investigate and cleared volume</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.alerts_trend}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="total" name="Total Alerts" stroke="#38bdf8" fill="url(#totalGrad)" />
                <Area type="monotone" dataKey="investigate" name="Investigate" stroke="#f87171" fill="transparent" />
                <Area type="monotone" dataKey="cleared" name="Cleared" stroke="#34d399" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
            <CardDescription>Breakdown across workflow lifecycle states</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.event_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {stats.event_distribution.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Statistics</CardTitle>
            <CardDescription>Top incident types by seeded event count</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.incident_statistics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" height={55} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="count" name="Incidents" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
