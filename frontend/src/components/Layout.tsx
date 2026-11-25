import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/investigate", label: "Need To Investigate", icon: AlertTriangle },
  { to: "/waiting", label: "Waiting", icon: Clock },
  { to: "/cleaning", label: "Cleaning", icon: Trash2 },
  { to: "/cleared", label: "Cleared", icon: CheckCircle2 },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-foreground">NEMESIS-X</div>
              <div className="text-[11px] text-muted-foreground">Phase 1 Foundation</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-sky-300 ring-1 ring-primary/30"
                    : "text-muted-foreground hover:bg-slate-800/70 hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="rounded-lg bg-slate-900/90 p-3">
          <div className="truncate text-sm font-medium text-foreground">{user?.name}</div>
          <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
          <div className="mt-2">
            <Badge variant={user?.role === "Admin" ? "info" : user?.role === "Operator" ? "warning" : "neutral"}>
              {user?.role}
            </Badge>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2 text-red-300 hover:text-red-200" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-slate-950/90 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 border-r border-border bg-slate-950">{sidebarContent}</aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-slate-950/80 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Open-World Video Intelligence Command Center
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>API Connected</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
