
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";

import { CleaningPage } from "@/pages/CleaningPage";
import { ClearedEventsPage } from "@/pages/ClearedEventsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DetectPage } from "@/pages/DetectPage";
import { DetectionHistoryPage } from "@/pages/DetectionHistoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { NeedToInvestigatePage } from "@/pages/NeedToInvestigatePage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import { WaitingPage } from "@/pages/WaitingPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Dashboard */}
                <Route
                  path="/dashboard"
                  element={<DashboardPage />}
                />

                {/* Phase 2 - Detection */}
                <Route
                  path="/detect"
                  element={<DetectPage />}
                />

                <Route
                  path="/detection-history"
                  element={<DetectionHistoryPage />}
                />

                {/* Phase 1 - Event Queues */}
                <Route
                  path="/investigate"
                  element={<NeedToInvestigatePage />}
                />

                <Route
                  path="/waiting"
                  element={<WaitingPage />}
                />

                <Route
                  path="/cleaning"
                  element={<CleaningPage />}
                />

                <Route
                  path="/cleared"
                  element={<ClearedEventsPage />}
                />

                {/* Reports */}
                <Route
                  path="/reports"
                  element={<ReportsPage />}
                />

                {/* Settings */}
                <Route
                  path="/settings"
                  element={<SettingsPage />}
                />

                {/* Phase 3.1 - Analytics */}
                <Route
                  path="/analytics"
                  element={<AnalyticsPage />}
                />
              </Route>
            </Route>

            {/* Default Navigation */}
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
