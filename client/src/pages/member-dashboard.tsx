import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CircleUserRound,
  Lock,
  MessageCircle,
  Mountain,
  Users,
} from "lucide-react";
import { MemberShell } from "@/components/member-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RetreatAccess {
  id: number;
  name: string;
  date: string;
  isPast: boolean;
  isStaff: boolean;
  isAttendee: boolean;
}

export default function MemberDashboard() {
  const { user } = useUser();
  const retreatsQuery = useQuery<{ retreats: RetreatAccess[] }>({
    queryKey: ["/api/member/my-retreats"],
  });
  const registrationsQuery = useQuery<{
    registrations: Array<{ id: number; retreatName: string; retreatDate: string; paymentStatus: string }>;
  }>({ queryKey: ["/api/member/registrations"] });
  const activityQuery = useQuery<{ notifications: Array<{ id: number; readAt?: string }> }>({
    queryKey: ["/api/hub/notifications"],
    refetchInterval: 30_000,
  });
  const unread = activityQuery.data?.notifications.filter((item) => !item.readAt).length ?? 0;

  return (
    <MemberShell eyebrow="Member Portal">
      <section className="border-b border-white/5 bg-[radial-gradient(circle_at_20%_20%,rgba(201,184,150,0.11),transparent_30%)]">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Your path</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-white md:text-6xl">
            Preparation, brotherhood, and the work that follows.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Everything for your retreat journey lives here—from arrival details to the circle you carry home.
          </p>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-6 py-10">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-white">My retreat containers</h2>
              <p className="mt-1 text-sm text-muted-foreground">Private spaces for the cohorts you walked with.</p>
            </div>
            <Button asChild variant="ghost"><Link href="/retreats">Explore retreats <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
          {retreatsQuery.data?.retreats.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {retreatsQuery.data.retreats.map((retreat) => (
                <Link key={retreat.id} href={`/member/retreats/${retreat.id}`}>
                  <Card className="group h-full cursor-pointer overflow-hidden border-primary/10 bg-[linear-gradient(135deg,rgba(30,51,40,0.9),rgba(15,26,20,0.95))] transition-all hover:-translate-y-0.5 hover:border-primary/40">
                    <CardContent className="flex items-center justify-between gap-5 p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                          <Mountain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2"><h3 className="font-serif text-xl text-white">{retreat.name}</h3>{retreat.isStaff && <Badge>Staff</Badge>}</div>
                          <p className="mt-1 text-sm text-muted-foreground">{retreat.date}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Lock className="mx-auto mb-4 h-9 w-9 text-primary/60" />
                <h3 className="font-serif text-xl text-white">No retreat container yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Your private hub opens after a paid registration or staff assignment.</p>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/member/alumni", title: "Alumni Commons", body: "Stay connected across cohorts", icon: Users },
            { href: "/member/discussions", title: "General Commons", body: "Share and ask for support", icon: MessageCircle },
            { href: "/member/activity", title: "Activity", body: unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You’re all caught up", icon: Bell },
            { href: "/member/profile", title: "My Profile", body: "Control visibility and consent", icon: CircleUserRound },
          ].map(({ href, title, body, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="h-full cursor-pointer transition-colors hover:border-primary/30">
                <CardContent className="p-5">
                  <Icon className="mb-4 h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        {registrationsQuery.data?.registrations.length ? (
          <section>
            <h2 className="mb-4 font-serif text-2xl text-white">Registration receipts</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {registrationsQuery.data.registrations.map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium text-white">{registration.retreatName}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" />{registration.retreatDate}</p>
                    </div>
                    <Badge variant="outline">{registration.paymentStatus}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <p className="pb-6 text-xs text-muted-foreground">
          Signed in as {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>
    </MemberShell>
  );
}
