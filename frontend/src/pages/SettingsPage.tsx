import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { User, UserRole } from "@/types";

export function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "Admin";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Operator");
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["users"],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await api.get<{ items: User[]; total: number }>("/users");
      return res.data;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<User>("/users", { name, email, password, role });
      return res.data;
    },
    onSuccess: (created) => {
      setFormMsg(`Created ${created.role} user: ${created.email}`);
      setName("");
      setEmail("");
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Failed to create user.";
      setFormMsg(detail);
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    createUserMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-sm text-muted-foreground">
          Session profile, RBAC role permissions, and Admin user management.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authenticated Profile</CardTitle>
            <CardDescription>Current JWT session identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assigned Role</span>
              <Badge variant="info">{user?.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Role-Based Access Control (RBAC)
            </CardTitle>
            <CardDescription>Phase 1 permission matrix enforced by FastAPI middleware</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div>
              <strong className="text-foreground">Admin:</strong> Full platform access, dashboard, investigation actions, user creation &amp; listing.
            </div>
            <div>
              <strong className="text-foreground">Operator:</strong> Dashboard, events inspection, queue transitions, and incident reports.
            </div>
            <div>
              <strong className="text-foreground">Viewer:</strong> Read-only access to dashboard metrics, event queues, and reports.
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                Provision User
              </CardTitle>
              <CardDescription>Create a new Admin, Operator, or Viewer account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <Input
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  required
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  required
                  type="password"
                  minLength={6}
                  placeholder="Initial Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="flex h-9 w-full rounded-md border border-input bg-slate-950/60 px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Viewer">Viewer</option>
                </select>
                {formMsg && <p className="text-xs text-sky-300">{formMsg}</p>}
                <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Platform Users ({usersQuery.data?.total ?? 0})</CardTitle>
              <CardDescription>Accounts stored in PostgreSQL</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQuery.data?.items.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">#{u.id}</TableCell>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "Admin" ? "info" : u.role === "Operator" ? "warning" : "neutral"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            User provisioning is restricted to <strong className="text-foreground">Admin</strong> accounts.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
