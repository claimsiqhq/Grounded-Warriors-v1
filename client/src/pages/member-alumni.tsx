import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BookOpen, CalendarDays, MessageCircle, Sparkles, Users } from "lucide-react";
import { Link } from "wouter";
import { MemberShell } from "@/components/member-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AlumniData {
  announcements: Array<{ id: number; title: string; body: string; isPinned: boolean }>;
  resources: Array<{ id: number; title: string; description: string; category: string; externalUrl?: string }>;
  events: Array<{ id: number; title: string; description: string; location: string; startsAt: string; meetingUrl?: string }>;
}

export default function MemberAlumni() {
  const { data, error } = useQuery<AlumniData>({ queryKey: ["/api/hub/alumni"] });

  return (
    <MemberShell eyebrow="Alumni Commons">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10 max-w-3xl">
          <Users className="mb-4 h-8 w-8 text-primary" />
          <h1 className="font-serif text-4xl text-white md:text-5xl">The fire stays lit.</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            A shared space across retreat cohorts for continued practice, gatherings, and brotherhood.
          </p>
        </div>

        {error ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Alumni access opens after a paid retreat registration.</CardContent></Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-8">
              <Card className="border-primary/20">
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> From the guides</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  {data?.announcements.length ? data.announcements.map((item) => (
                    <article key={item.id} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-center gap-2"><h3 className="font-semibold text-white">{item.title}</h3>{item.isPinned && <Badge>Pinned</Badge>}</div>
                      <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{item.body}</p>
                    </article>
                  )) : <p className="text-sm text-muted-foreground">Community announcements will appear here.</p>}
                </CardContent>
              </Card>

              <section>
                <div className="mb-4 flex items-end justify-between">
                  <div><h2 className="font-serif text-3xl text-white">Upcoming gatherings</h2><p className="mt-1 text-sm text-muted-foreground">Reconnect online or around the fire.</p></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {data?.events.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-5">
                        <p className="text-xs uppercase tracking-wider text-primary">{format(new Date(event.startsAt), "MMM d, yyyy · h:mm a")}</p>
                        <h3 className="mt-2 font-semibold text-white">{event.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                        {event.meetingUrl && <Button asChild size="sm" variant="outline" className="mt-4"><a href={event.meetingUrl} target="_blank" rel="noreferrer">Join gathering</a></Button>}
                      </CardContent>
                    </Card>
                  ))}
                  {!data?.events.length && <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">New alumni gatherings are coming soon.</CardContent></Card>}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /> General Commons</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Share lessons, ask for support, and stay connected across cohorts.</p>
                  <Button asChild className="mt-4"><Link href="/member/discussions">Enter the commons</Link></Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Alumni resources</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {data?.resources.map((resource) => (
                    <a key={resource.id} href={resource.externalUrl} target="_blank" rel="noreferrer" className="block rounded-md border border-white/10 p-3 transition-colors hover:border-primary/40">
                      <Badge variant="outline">{resource.category}</Badge>
                      <p className="mt-2 font-medium text-white">{resource.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{resource.description}</p>
                    </a>
                  ))}
                  {!data?.resources.length && <p className="text-sm text-muted-foreground">Shared practices and guides will appear here.</p>}
                </CardContent>
              </Card>
              <Button asChild variant="outline" className="w-full"><Link href="/retreats"><CalendarDays className="mr-2 h-4 w-4" /> Explore another retreat</Link></Button>
            </aside>
          </div>
        )}
      </div>
    </MemberShell>
  );
}
