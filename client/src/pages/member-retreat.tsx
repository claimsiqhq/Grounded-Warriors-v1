import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Download,
  HandHeart,
  ImagePlus,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { MemberShell } from "@/components/member-shell";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface HubItem {
  id: number;
  title: string;
  description?: string;
  createdAt?: string;
}

interface HubOverview {
  retreat: { id: number; name: string; date: string; isPast: boolean };
  settings: { welcomeMessage: string; timezone: string } | null;
  announcements: Array<HubItem & { body: string; isPinned: boolean }>;
  itinerary: Array<HubItem & { startsAt: string; endsAt?: string; location: string }>;
  resources: Array<HubItem & { category: string; externalUrl?: string }>;
  events: Array<HubItem & { startsAt: string; endsAt?: string; location: string; meetingUrl?: string }>;
  checklist: Array<HubItem & { completed: boolean; phase: string; dueAt?: string }>;
  milestones: Array<HubItem & { completed: boolean; daysAfter: number }>;
  buddy: {
    optedIn: boolean;
    notes: string;
    match: null | { displayName: string; buddyContact: string; location: string };
  };
  canManage: boolean;
  mediaConfigured: boolean;
}

interface Discussion extends HubItem {
  content: string;
  userName: string;
  isPinned: boolean;
  createdAt: string;
}

async function preparePhoto(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file");
  const image = await createImageBitmap(file);
  const scale = Math.min(1, 2200 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this photo");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.86),
  );
  if (!blob) throw new Error("Your browser could not prepare this photo");
  return blob;
}

function EmptyState({ icon: Icon, title, body }: { icon: typeof Bell; title: string; body: string }) {
  return (
    <Card className="border-dashed border-white/10 bg-card/40">
      <CardContent className="py-12 text-center">
        <Icon className="mx-auto mb-4 h-9 w-9 text-primary/70" />
        <h3 className="font-serif text-xl text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

export default function MemberRetreat() {
  const params = useParams<{ id: string }>();
  const retreatId = Number(params.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [buddyNotes, setBuddyNotes] = useState("");
  const [caption, setCaption] = useState("");

  const overviewQuery = useQuery<HubOverview>({
    queryKey: ["/api/hub/retreats", retreatId, "overview"],
    queryFn: async () => (await apiRequest("GET", `/api/hub/retreats/${retreatId}/overview`)).json(),
    enabled: Number.isInteger(retreatId),
    refetchInterval: 30_000,
  });

  const directoryQuery = useQuery<{ members: Array<{ userId: string; displayName: string; bio: string; location: string; interests: string[]; imageUrl?: string }> }>({
    queryKey: ["/api/hub/retreats", retreatId, "directory"],
    queryFn: async () => (await apiRequest("GET", `/api/hub/retreats/${retreatId}/directory`)).json(),
    enabled: Boolean(overviewQuery.data),
  });

  const discussionsQuery = useQuery<{ discussions: Discussion[] }>({
    queryKey: ["/api/discussions", { retreatId }],
    queryFn: async () => (await apiRequest("GET", `/api/discussions?retreatId=${retreatId}`)).json(),
    enabled: Boolean(overviewQuery.data),
    refetchInterval: 30_000,
  });

  const photosQuery = useQuery<{ photos: Array<{ id: number; caption: string; status: string; url: string; displayName?: string; createdAt: string }>; canManage: boolean }>({
    queryKey: ["/api/hub/retreats", retreatId, "photos"],
    queryFn: async () => (await apiRequest("GET", `/api/hub/retreats/${retreatId}/photos`)).json(),
    enabled: Boolean(overviewQuery.data?.mediaConfigured),
    staleTime: 4 * 60_000,
  });

  const toggleChecklist = useMutation({
    mutationFn: ({ id, completed, kind }: { id: number; completed: boolean; kind: "checklist" | "milestones" }) =>
      apiRequest("PUT", `/api/hub/retreats/${retreatId}/${kind}/${id}`, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/hub/retreats", retreatId, "overview"] }),
  });

  const createPost = useMutation({
    mutationFn: () => apiRequest("POST", "/api/discussions", { retreatId, title: newTitle, content: newContent }),
    onSuccess: () => {
      setNewTitle("");
      setNewContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", { retreatId }] });
      toast({ title: "Shared with your circle" });
    },
  });

  const buddyMutation = useMutation({
    mutationFn: (optedIn: boolean) =>
      apiRequest("PUT", `/api/hub/retreats/${retreatId}/buddy`, { optedIn, notes: buddyNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hub/retreats", retreatId, "overview"] });
      toast({ title: "Buddy preferences updated" });
    },
    onError: (error: Error) => toast({ title: "Could not update", description: error.message, variant: "destructive" }),
  });

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      const blob = await preparePhoto(file);
      const upload = await apiRequest("POST", `/api/hub/retreats/${retreatId}/photos/upload-url`, {
        contentType: "image/webp",
        byteSize: blob.size,
      }).then((response) => response.json());
      const form = new FormData();
      form.append("cacheControl", "3600");
      form.append("", blob, "retreat-photo.webp");
      const uploaded = await fetch(upload.signedUrl, {
        method: "PUT",
        headers: { "x-upsert": "false" },
        body: form,
      });
      if (!uploaded.ok) throw new Error("The photo upload did not complete");
      await apiRequest("POST", `/api/hub/retreats/${retreatId}/photos`, {
        path: upload.path,
        caption,
        contentType: "image/webp",
        byteSize: blob.size,
      });
    },
    onSuccess: () => {
      setCaption("");
      queryClient.invalidateQueries({ queryKey: ["/api/hub/retreats", retreatId, "photos"] });
      toast({ title: "Photo sent for approval" });
    },
    onError: (error: Error) => toast({ title: "Upload failed", description: error.message, variant: "destructive" }),
  });

  const overview = overviewQuery.data;
  const checklistProgress = useMemo(() => {
    if (!overview?.checklist.length) return 0;
    return Math.round((overview.checklist.filter((item) => item.completed).length / overview.checklist.length) * 100);
  }, [overview]);

  if (overviewQuery.isLoading) {
    return (
      <MemberShell eyebrow="Private Retreat Container">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MemberShell>
    );
  }

  if (overviewQuery.error || !overview) {
    return (
      <MemberShell eyebrow="Private Retreat Container">
        <div className="container mx-auto px-6 py-16">
          <EmptyState icon={Lock} title="Container unavailable" body="This retreat is private to its registered participants and staff." />
        </div>
      </MemberShell>
    );
  }

  return (
    <MemberShell eyebrow="Private Retreat Container">
      <section className="border-b border-white/5 bg-card/20">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
                <Lock className="h-3.5 w-3.5" /> Cohort only
              </div>
              <h1 className="font-serif text-4xl text-white md:text-5xl">{overview.retreat.name}</h1>
              <p className="mt-2 text-muted-foreground">{overview.retreat.date}</p>
            </div>
            {overview.canManage && (
              <Button asChild variant="outline">
                <Link href={`/admin?retreat=${retreatId}`}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Manage hub
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:px-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-8 h-auto w-full justify-start gap-1 overflow-x-auto bg-card/60 p-1">
            {[
              ["overview", "Overview"],
              ["prepare", "Prepare"],
              ["schedule", "Schedule"],
              ["circle", "Circle"],
              ["people", "People"],
              ["photos", "Photos"],
              ["integration", "Integration"],
            ].map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="min-w-fit">{label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {overview.settings?.welcomeMessage && (
              <Card className="overflow-hidden border-primary/20 bg-[linear-gradient(135deg,rgba(201,184,150,0.13),rgba(30,51,40,0.75))]">
                <CardContent className="p-7">
                  <Sparkles className="mb-4 h-5 w-5 text-primary" />
                  <p className="max-w-3xl font-serif text-2xl leading-relaxed text-white">{overview.settings.welcomeMessage}</p>
                </CardContent>
              </Card>
            )}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Announcements</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {overview.announcements.length ? overview.announcements.slice(0, 4).map((item) => (
                    <article key={item.id} className="border-l-2 border-primary/40 pl-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        {item.isPinned && <Badge variant="secondary">Pinned</Badge>}
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{item.body}</p>
                    </article>
                  )) : <p className="text-sm text-muted-foreground">No announcements yet.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Preparation</CardTitle></CardHeader>
                <CardContent>
                  <div className="mb-3 flex items-end justify-between">
                    <span className="font-serif text-4xl text-white">{checklistProgress}%</span>
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                  <Progress value={checklistProgress} />
                  <p className="mt-3 text-sm text-muted-foreground">Your preparation progress is private to you.</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Next on the path</CardTitle></CardHeader>
                <CardContent>
                  {overview.itinerary[0] ? (
                    <>
                      <p className="font-semibold text-white">{overview.itinerary[0].title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{format(new Date(overview.itinerary[0].startsAt), "EEEE, MMM d · h:mm a")}</p>
                    </>
                  ) : <p className="text-sm text-muted-foreground">The schedule will appear here when staff publish it.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><HandHeart className="h-5 w-5 text-primary" /> Accountability buddy</CardTitle></CardHeader>
                <CardContent>
                  {overview.buddy.match ? (
                    <>
                      <p className="font-semibold text-white">{overview.buddy.match.displayName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{overview.buddy.match.buddyContact}</p>
                    </>
                  ) : <p className="text-sm text-muted-foreground">{overview.buddy.optedIn ? "You are in the matching pool." : "Opt in from the People tab when you are ready."}</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prepare" className="space-y-6">
            <div>
              <h2 className="font-serif text-3xl text-white">Prepare with intention</h2>
              <p className="mt-2 text-muted-foreground">Only completion is stored—never medical or private intake details.</p>
            </div>
            <Card>
              <CardContent className="divide-y divide-white/5 p-2 md:p-4">
                {overview.checklist.length ? overview.checklist.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-4 rounded-md p-4 hover:bg-white/[0.03]">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) => toggleChecklist.mutate({ id: item.id, completed: checked === true, kind: "checklist" })}
                      aria-label={`Mark ${item.title} complete`}
                    />
                    <span>
                      <span className={item.completed ? "text-muted-foreground line-through" : "text-white"}>{item.title}</span>
                      {item.description && <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>}
                    </span>
                  </label>
                )) : <EmptyState icon={Check} title="Checklist coming soon" body="Retreat staff are preparing your readiness path." />}
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              {overview.resources.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <Badge variant="outline">{resource.category}</Badge>
                      <h3 className="mt-3 font-semibold text-white">{resource.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                    {resource.externalUrl && <Button asChild size="icon" variant="ghost"><a href={resource.externalUrl} target="_blank" rel="noreferrer"><BookOpen className="h-4 w-4" /></a></Button>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-8">
            <div>
              <h2 className="font-serif text-3xl text-white">Schedule and gatherings</h2>
              <p className="mt-2 text-muted-foreground">All times shown in your local browser time.</p>
            </div>
            <div className="space-y-3">
              {overview.itinerary.length ? overview.itinerary.map((item) => (
                <Card key={item.id}>
                  <CardContent className="grid gap-4 p-5 sm:grid-cols-[170px_1fr]">
                    <div className="text-sm text-primary">{format(new Date(item.startsAt), "EEE, MMM d · h:mm a")}</div>
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      {item.location && <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{item.location}</p>}
                      {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
                    </div>
                  </CardContent>
                </Card>
              )) : <EmptyState icon={Clock3} title="Schedule coming soon" body="Retreat staff will publish the itinerary here." />}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {overview.events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-wider text-primary">{format(new Date(event.startsAt), "MMM d · h:mm a")}</p>
                    <h3 className="mt-2 font-semibold text-white">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <a href={`/api/hub/retreats/${retreatId}/events/${event.id}.ics`}><Download className="mr-2 h-4 w-4" /> Add to calendar</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="circle" className="space-y-6">
            <div>
              <h2 className="font-serif text-3xl text-white">The circle</h2>
              <p className="mt-2 text-muted-foreground">A private conversation space for this retreat cohort.</p>
            </div>
            <Card>
              <CardContent className="space-y-3 p-5">
                <Input placeholder="Give your post a clear title" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} maxLength={160} />
                <Textarea placeholder="What needs to be shared with this circle?" value={newContent} onChange={(event) => setNewContent(event.target.value)} maxLength={10000} rows={4} />
                <Button disabled={createPost.isPending || newTitle.trim().length < 3 || !newContent.trim()} onClick={() => createPost.mutate()}>
                  {createPost.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Share
                </Button>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {discussionsQuery.data?.discussions.map((discussion) => (
                <Link key={discussion.id} href={`/member/discussions/${discussion.id}`}>
                  <Card className="cursor-pointer transition-colors hover:border-primary/40">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2">
                        {discussion.isPinned && <Badge>Pinned</Badge>}
                        <h3 className="font-semibold text-white">{discussion.title}</h3>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{discussion.content}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{discussion.userName} · {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {!discussionsQuery.data?.discussions.length && <EmptyState icon={MessageCircle} title="Quiet in the circle" body="Be the first to open a conversation." />}
            </div>
          </TabsContent>

          <TabsContent value="people" className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-serif text-3xl text-white">Your cohort</h2>
                <p className="mt-2 text-muted-foreground">Only members who opt into the directory appear here.</p>
              </div>
              <Button asChild variant="outline"><Link href="/member/profile"><CircleUserRound className="mr-2 h-4 w-4" /> Edit my profile</Link></Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {directoryQuery.data?.members.map((member) => (
                <Card key={member.userId}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                        {member.imageUrl ? <img src={member.imageUrl} alt="" className="h-full w-full object-cover" /> : <Users className="h-5 w-5 text-primary" />}
                      </div>
                      <div><h3 className="font-semibold text-white">{member.displayName}</h3><p className="text-xs text-muted-foreground">{member.location}</p></div>
                    </div>
                    {member.bio && <p className="mt-4 text-sm text-muted-foreground">{member.bio}</p>}
                    <div className="mt-3 flex flex-wrap gap-1">{member.interests.map((interest) => <Badge key={interest} variant="secondary">{interest}</Badge>)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-primary/20">
              <CardHeader><CardTitle className="flex items-center gap-2"><HandHeart className="h-5 w-5 text-primary" /> Accountability buddy</CardTitle></CardHeader>
              <CardContent>
                {overview.buddy.match ? (
                  <div>
                    <p className="font-serif text-2xl text-white">{overview.buddy.match.displayName}</p>
                    {overview.buddy.match.location && <p className="mt-1 text-sm text-muted-foreground">{overview.buddy.match.location}</p>}
                    <p className="mt-4 rounded-md border border-white/10 bg-background/50 p-3 text-sm text-white">{overview.buddy.match.buddyContact}</p>
                  </div>
                ) : (
                  <div className="max-w-xl space-y-4">
                    <p className="text-sm text-muted-foreground">Opt in and retreat staff will pair you with another participant. Your private contact is shared only after matching.</p>
                    <Textarea placeholder="Optional matching note" value={buddyNotes || overview.buddy.notes} onChange={(event) => setBuddyNotes(event.target.value)} maxLength={400} />
                    <Button onClick={() => buddyMutation.mutate(!overview.buddy.optedIn)} disabled={buddyMutation.isPending}>
                      {overview.buddy.optedIn ? "Leave matching pool" : "Join matching pool"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <div>
              <h2 className="font-serif text-3xl text-white">Retreat photographs</h2>
              <p className="mt-2 text-muted-foreground">Private, cohort-only, and approved by staff before appearing.</p>
            </div>
            {!overview.mediaConfigured ? (
              <EmptyState icon={Camera} title="Photo sharing is being prepared" body="Private media storage has not been connected yet." />
            ) : (
              <>
                <Card>
                  <CardContent className="flex flex-col gap-3 p-5 md:flex-row">
                    <Input placeholder="Optional caption" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={500} />
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadPhoto.mutate(file);
                      event.target.value = "";
                    }} />
                    <Button onClick={() => fileRef.current?.click()} disabled={uploadPhoto.isPending}>
                      {uploadPhoto.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />} Add photo
                    </Button>
                  </CardContent>
                </Card>
                <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                  {photosQuery.data?.photos.map((photo) => (
                    <figure key={photo.id} className="mb-4 break-inside-avoid overflow-hidden rounded-lg border border-white/10 bg-card">
                      <img src={photo.url} alt={photo.caption || "Retreat memory"} className="w-full object-cover" loading="lazy" />
                      <figcaption className="p-4">
                        {photo.status !== "approved" && <Badge variant="secondary">{photo.status}</Badge>}
                        {photo.caption && <p className="mt-2 text-sm text-white">{photo.caption}</p>}
                        <p className="mt-2 text-xs text-muted-foreground">{photo.displayName || "Retreat member"}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
                {!photosQuery.data?.photos.length && <EmptyState icon={Camera} title="No photographs yet" body="Share the first memory after enabling photo consent in your profile." />}
              </>
            )}
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <div>
              <h2 className="font-serif text-3xl text-white">Carry it home</h2>
              <p className="mt-2 text-muted-foreground">Mark your progress privately. Share reflections only when you choose to post in the circle.</p>
            </div>
            <div className="relative space-y-4 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-primary/20">
              {overview.milestones.map((milestone) => (
                <Card key={milestone.id} className="relative ml-10">
                  <button
                    className="absolute -left-[2.9rem] top-5 flex h-5 w-5 items-center justify-center rounded-full border border-primary bg-background"
                    onClick={() => toggleChecklist.mutate({ id: milestone.id, completed: !milestone.completed, kind: "milestones" })}
                    aria-label={`Mark ${milestone.title} ${milestone.completed ? "incomplete" : "complete"}`}
                  >
                    {milestone.completed && <Check className="h-3 w-3 text-primary" />}
                  </button>
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-wider text-primary">Day {milestone.daysAfter}</p>
                    <h3 className="mt-2 font-semibold text-white">{milestone.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
                    <Button asChild variant="ghost" size="sm" className="mt-3 px-0"><Link href={`/member/retreats/${retreatId}?tab=circle`}>Share with the circle</Link></Button>
                  </CardContent>
                </Card>
              ))}
              {!overview.milestones.length && <EmptyState icon={Sparkles} title="Integration path coming soon" body="Staff are preparing your follow-through milestones." />}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MemberShell>
  );
}
