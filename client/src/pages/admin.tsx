import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Shield, Trash2, UserPlus, Mail, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CoachingInquiry, CoachingStatus } from "@shared/schema";

interface Retreat {
  id: number;
  name: string;
  date: string;
  isPast: boolean;
}

interface StaffEntry {
  id: number;
  retreatId: number;
  userId: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
}

function StaffPanel({ retreat }: { retreat: Retreat }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const staffQuery = useQuery({
    queryKey: ["/api/admin/retreats", retreat.id, "staff"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/retreats/${retreat.id}/staff`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load staff");
      return res.json() as Promise<{ staff: StaffEntry[] }>;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (targetEmail: string) => {
      const res = await fetch(`/api/admin/retreats/${retreat.id}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: targetEmail }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to add staff");
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/retreats", retreat.id, "staff"] });
      setEmail("");
      toast({ title: "Staff added", description: `Designated for ${retreat.name}.` });
    },
    onError: (e: Error) => {
      toast({ title: "Couldn't add staff", description: e.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/retreats/${retreat.id}/staff/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/retreats", retreat.id, "staff"] });
      toast({ title: "Removed" });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) addMutation.mutate(email.trim());
  };

  const staff = staffQuery.data?.staff || [];

  return (
    <Card data-testid={`card-retreat-${retreat.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-white">{retreat.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{retreat.date}{retreat.isPast ? " · past" : ""}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/member/retreats/${retreat.id}`} data-testid={`link-enter-${retreat.id}`}>Enter container</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            type="email"
            placeholder="member@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
            data-testid={`input-staff-email-${retreat.id}`}
          />
          <Button type="submit" disabled={addMutation.isPending} className="gap-2" data-testid={`button-add-staff-${retreat.id}`}>
            {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Add
          </Button>
        </form>

        <div>
          <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Designated Staff</h4>
          {staffQuery.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : staff.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff designated yet — only attendees and admins can enter this container.</p>
          ) : (
            <ul className="divide-y divide-border">
              {staff.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2" data-testid={`row-staff-${s.id}`}>
                  <div>
                    <p className="text-white text-sm">
                      {s.user
                        ? `${[s.user.firstName, s.user.lastName].filter(Boolean).join(" ") || s.user.email}`
                        : "(unknown user)"}
                    </p>
                    {s.user && (s.user.firstName || s.user.lastName) && (
                      <p className="text-xs text-muted-foreground">{s.user.email}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMutation.mutate(s.userId)}
                    disabled={removeMutation.isPending}
                    data-testid={`button-remove-staff-${s.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function coachLabel(key: string) {
  if (key === "john") return "John Shoust";
  if (key === "brian") return "Brian Coones";
  return "No preference";
}

function statusClass(s: string) {
  if (s === "new") return "bg-primary/20 text-primary border-primary/40";
  if (s === "contacted") return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  return "bg-white/5 text-muted-foreground border-white/10";
}

function CoachingInquiriesPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inquiriesQuery = useQuery({
    queryKey: ["/api/admin/coaching/inquiries"],
    queryFn: async () => {
      const res = await fetch("/api/admin/coaching/inquiries", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load inquiries");
      return res.json() as Promise<{ inquiries: CoachingInquiry[] }>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: CoachingStatus }) => {
      const res = await fetch(`/api/admin/coaching/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to update");
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaching/inquiries"] });
      toast({ title: "Status updated" });
    },
    onError: (e: Error) => {
      toast({ title: "Couldn't update", description: e.message, variant: "destructive" });
    },
  });

  const inquiries = inquiriesQuery.data?.inquiries || [];

  return (
    <div className="space-y-4" data-testid="section-coaching-inquiries">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-2xl text-white">Coaching Inquiries</h2>
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          {inquiries.length} total
        </span>
      </div>
      {inquiriesQuery.isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No coaching applications yet.
          </CardContent>
        </Card>
      ) : (
        inquiries.map((q) => {
          const snippet =
            q.workingOn.length > 180 ? q.workingOn.slice(0, 180) + "…" : q.workingOn;
          return (
            <Card key={q.id} data-testid={`card-inquiry-${q.id}`}>
              <CardContent className="py-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg" data-testid={`text-inquiry-name-${q.id}`}>
                      {q.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                      <a
                        href={`mailto:${q.email}`}
                        className="inline-flex items-center gap-1 hover:text-primary"
                        data-testid={`link-inquiry-email-${q.id}`}
                      >
                        <Mail className="w-3 h-3" /> {q.email}
                      </a>
                      {q.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {q.phone}
                        </span>
                      )}
                      <span>Prefers: {coachLabel(q.preferredCoach)}</span>
                      <span>{formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs uppercase tracking-widest px-2 py-1 border ${statusClass(q.status)}`}
                    data-testid={`badge-status-${q.id}`}
                  >
                    {q.status}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed" data-testid={`text-working-on-${q.id}`}>
                  {snippet}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateMutation.isPending || q.status === "contacted"}
                    onClick={() => updateMutation.mutate({ id: q.id, status: "contacted" })}
                    data-testid={`button-mark-contacted-${q.id}`}
                  >
                    Mark contacted
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateMutation.isPending || q.status === "closed"}
                    onClick={() => updateMutation.mutate({ id: q.id, status: "closed" })}
                    data-testid={`button-mark-closed-${q.id}`}
                  >
                    Mark closed
                  </Button>
                  {q.status !== "new" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ id: q.id, status: "new" })}
                      data-testid={`button-mark-new-${q.id}`}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();

  const retreatsQuery = useQuery({
    queryKey: ["/api/retreats"],
    queryFn: async () => {
      const res = await fetch("/api/retreats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load retreats");
      return res.json() as Promise<{ retreats: Retreat[] }>;
    },
    enabled: !!user && user.role === "admin",
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Shield className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h2 className="font-serif text-2xl text-white mb-2">Admins Only</h2>
              <p className="text-muted-foreground mb-6">This area is restricted to John and Brian.</p>
              <Button asChild variant="outline">
                <Link href="/member">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const retreats = retreatsQuery.data?.retreats || [];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="pt-32 pb-8 bg-gradient-to-b from-card to-background">
          <div className="container px-6 mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Link href="/member" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-2 block font-semibold">Admin</span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight">Retreat Staff</h1>
              <p className="text-muted-foreground mt-3 max-w-2xl">
                Designate which members get staff access to each retreat container. Staff can read and post inside the container alongside attendees.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-8 pb-12">
          <div className="container px-6 mx-auto space-y-6">
            {retreatsQuery.isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            ) : (
              retreats.map((r) => <StaffPanel key={r.id} retreat={r} />)
            )}
          </div>
        </section>

        <section className="py-8 pb-24 border-t border-white/5">
          <div className="container px-6 mx-auto">
            <CoachingInquiriesPanel />
          </div>
        </section>
      </div>
    </Layout>
  );
}
