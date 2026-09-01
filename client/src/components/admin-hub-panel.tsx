import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Clock3,
  Image,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UserRoundCheck,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Retreat {
  id: number;
  name: string;
  date: string;
}

type ContentType = "announcement" | "itinerary" | "resource" | "event" | "checklist" | "milestone";

interface ContentItem {
  id: number;
  title: string;
  body?: string;
  description?: string;
  startsAt?: string;
  externalUrl?: string;
  phase?: string;
  daysAfter?: number;
  status?: string;
  caption?: string;
  url?: string;
}

const contentMeta: Record<ContentType, { label: string; icon: typeof Bell }> = {
  announcement: { label: "Announcements", icon: Bell },
  itinerary: { label: "Itinerary", icon: Clock3 },
  resource: { label: "Resources", icon: BookOpen },
  event: { label: "Events", icon: CalendarDays },
  checklist: { label: "Checklist", icon: CheckSquare },
  milestone: { label: "Integration", icon: Sparkles },
};

export function AdminHubPanel({ retreats }: { retreats: Retreat[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [retreatId, setRetreatId] = useState<number | null>(null);
  const [type, setType] = useState<ContentType>("announcement");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [locationOrUrl, setLocationOrUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [numberValue, setNumberValue] = useState("30");
  const [userOne, setUserOne] = useState("");
  const [userTwo, setUserTwo] = useState("");

  useEffect(() => {
    if (retreatId === null && retreats[0]) setRetreatId(retreats[0].id);
  }, [retreatId, retreats]);

  const overviewQuery = useQuery<any>({
    queryKey: ["/api/hub/retreats", retreatId, "overview"],
    queryFn: async () => (await apiRequest("GET", `/api/hub/retreats/${retreatId}/overview`)).json(),
    enabled: retreatId !== null,
  });
  const buddyQuery = useQuery<any>({
    queryKey: ["/api/hub/manage/retreats", retreatId, "buddies"],
    queryFn: async () => (await apiRequest("GET", `/api/hub/manage/retreats/${retreatId}/buddies`)).json(),
    enabled: retreatId !== null,
  });
  const photosQuery = useQuery<any>({
    queryKey: ["/api/hub/retreats", retreatId, "photos"],
    queryFn: async () => (await apiRequest("GET", `/api/hub/retreats/${retreatId}/photos`)).json(),
    enabled: Boolean(retreatId && overviewQuery.data?.mediaConfigured),
  });
  const reportsQuery = useQuery<any>({ queryKey: ["/api/hub/manage/reports"] });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/hub/retreats", retreatId, "overview"] });
    queryClient.invalidateQueries({ queryKey: ["/api/hub/manage/retreats", retreatId, "buddies"] });
    queryClient.invalidateQueries({ queryKey: ["/api/hub/retreats", retreatId, "photos"] });
    queryClient.invalidateQueries({ queryKey: ["/api/hub/manage/reports"] });
  };

  const initializeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/hub/retreats/${retreatId}/initialize`),
    onSuccess: () => { invalidate(); toast({ title: "Retreat hub initialized" }); },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!retreatId) throw new Error("Choose a retreat");
      let payload: Record<string, unknown>;
      if (type === "announcement") payload = { title, body: details, isPinned: false, isPublished: true };
      else if (type === "resource") payload = { title, description: details, category: "guide", externalUrl: locationOrUrl, sortOrder: 0, isPublished: true };
      else if (type === "itinerary") payload = { title, description: details, location: locationOrUrl, startsAt, endsAt: null, sortOrder: 0 };
      else if (type === "event") payload = { title, description: details, location: locationOrUrl, meetingUrl: null, startsAt, endsAt: null };
      else if (type === "checklist") payload = { title, description: details, phase: "prepare", dueAt: null, sortOrder: Number(numberValue) || 0, isActive: true };
      else payload = { title, description: details, daysAfter: Number(numberValue), sortOrder: Number(numberValue), isActive: true };
      await apiRequest("POST", `/api/hub/manage/${retreatId}/${type}`, payload);
    },
    onSuccess: () => {
      setTitle(""); setDetails(""); setLocationOrUrl(""); setStartsAt("");
      invalidate();
      toast({ title: `${contentMeta[type].label} updated` });
    },
    onError: (error: Error) => toast({ title: "Could not create item", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ itemType, id }: { itemType: ContentType; id: number }) =>
      apiRequest("DELETE", `/api/hub/manage/${retreatId}/${itemType}/${id}`),
    onSuccess: () => { invalidate(); toast({ title: "Item removed" }); },
  });

  const matchMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/hub/manage/retreats/${retreatId}/buddies/match`, { userOneId: userOne, userTwoId: userTwo }),
    onSuccess: () => { setUserOne(""); setUserTwo(""); invalidate(); toast({ title: "Buddy match created" }); },
    onError: (error: Error) => toast({ title: "Could not match", description: error.message, variant: "destructive" }),
  });

  const endMatchMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/hub/manage/retreats/${retreatId}/buddies/${id}`),
    onSuccess: invalidate,
  });

  const photoMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
      apiRequest("PUT", `/api/hub/manage/retreats/${retreatId}/photos/${id}`, { status }),
    onSuccess: invalidate,
  });

  const reportMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "resolved" | "dismissed" }) =>
      apiRequest("PUT", `/api/hub/manage/reports/${id}`, { status }),
    onSuccess: invalidate,
  });

  const currentItems: ContentItem[] = useMemo(() => {
    const data = overviewQuery.data;
    if (!data) return [];
    return {
      announcement: data.announcements,
      itinerary: data.itinerary,
      resource: data.resources,
      event: data.events,
      checklist: data.checklist,
      milestone: data.milestones,
    }[type] ?? [];
  }, [overviewQuery.data, type]);

  const selectedRetreat = retreats.find((retreat) => retreat.id === retreatId);
  const TypeIcon = contentMeta[type].icon;
  const needsDate = type === "itinerary" || type === "event";
  const needsLocation = type === "itinerary" || type === "event" || type === "resource";
  const needsNumber = type === "checklist" || type === "milestone";

  if (!retreats.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-primary/15 bg-card/50 p-5 md:flex-row md:items-end md:justify-between">
        <div className="w-full max-w-md space-y-2">
          <Label>Retreat hub</Label>
          <Select value={retreatId?.toString()} onValueChange={(value) => setRetreatId(Number(value))}>
            <SelectTrigger><SelectValue placeholder="Choose a retreat" /></SelectTrigger>
            <SelectContent>{retreats.map((retreat) => <SelectItem key={retreat.id} value={retreat.id.toString()}>{retreat.name} · {retreat.date}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => initializeMutation.mutate()} disabled={initializeMutation.isPending}>
          <RefreshCw className="mr-2 h-4 w-4" /> Initialize defaults
        </Button>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="buddies">Buddy matching</TabsTrigger>
          <TabsTrigger value="photos">Photo moderation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 pt-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(contentMeta) as ContentType[]).map((itemType) => {
              const Icon = contentMeta[itemType].icon;
              return <Button key={itemType} variant={type === itemType ? "default" : "outline"} size="sm" onClick={() => setType(itemType)}><Icon className="mr-2 h-4 w-4" />{contentMeta[itemType].label}</Button>;
            })}
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TypeIcon className="h-5 w-5 text-primary" /> Add {contentMeta[type].label.toLowerCase()}</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <Input placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} />
              <Textarea placeholder={type === "announcement" ? "Announcement" : "Description"} value={details} onChange={(event) => setDetails(event.target.value)} rows={3} />
              {needsLocation && <Input placeholder={type === "resource" ? "https://resource-link…" : "Location"} value={locationOrUrl} onChange={(event) => setLocationOrUrl(event.target.value)} />}
              {needsDate && <div className="space-y-2"><Label>Start date and time</Label><Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></div>}
              {needsNumber && <div className="space-y-2"><Label>{type === "milestone" ? "Days after retreat" : "Display order"}</Label><Input type="number" min="0" max={type === "milestone" ? 730 : 10000} value={numberValue} onChange={(event) => setNumberValue(event.target.value)} /></div>}
              <Button className="w-fit" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || title.trim().length < 2 || (needsDate && !startsAt)}>
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Add item
              </Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {currentItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body || item.description}</p>
                    {item.startsAt && <p className="mt-2 text-xs text-primary">{new Date(item.startsAt).toLocaleString()}</p>}
                    {typeof item.daysAfter === "number" && <Badge className="mt-2">Day {item.daysAfter}</Badge>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate({ itemType: type, id: item.id })} aria-label={`Delete ${item.title}`}><Trash2 className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            ))}
            {!currentItems.length && <p className="py-8 text-center text-sm text-muted-foreground">No {contentMeta[type].label.toLowerCase()} for {selectedRetreat?.name} yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="buddies" className="space-y-6 pt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserRoundCheck className="h-5 w-5 text-primary" /> Create a consented match</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[userOne, userTwo].map((value, index) => (
                <Select key={index} value={value} onValueChange={index === 0 ? setUserOne : setUserTwo}>
                  <SelectTrigger><SelectValue placeholder={`Choose member ${index + 1}`} /></SelectTrigger>
                  <SelectContent>{buddyQuery.data?.pool.map((member: any) => <SelectItem key={member.userId} value={member.userId}>{member.displayName || "Member"} · {member.location || "Location private"}</SelectItem>)}</SelectContent>
                </Select>
              ))}
              <Button className="md:col-span-2 md:w-fit" onClick={() => matchMutation.mutate()} disabled={!userOne || !userTwo || userOne === userTwo}>Create match</Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {buddyQuery.data?.matches.map((match: any) => (
              <Card key={match.id}><CardContent className="flex items-center justify-between p-4"><span className="text-sm text-white">Active pairing #{match.id}</span><Button variant="outline" size="sm" onClick={() => endMatchMutation.mutate(match.id)}>End match</Button></CardContent></Card>
            ))}
            {!buddyQuery.data?.matches.length && <p className="text-sm text-muted-foreground">No active buddy matches.</p>}
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4 pt-4">
          {!overviewQuery.data?.mediaConfigured ? <Card><CardContent className="p-8 text-center text-muted-foreground">Connect Supabase Storage to enable photo review.</CardContent></Card> : photosQuery.data?.photos.filter((photo: ContentItem) => photo.status === "pending").map((photo: ContentItem) => (
            <Card key={photo.id}>
              <CardContent className="grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                {photo.url ? <img src={photo.url} alt="" className="h-24 w-full rounded object-cover sm:w-28" /> : <Image className="h-10 w-10 text-muted-foreground" />}
                <div><p className="text-sm text-white">{photo.caption || "No caption"}</p><Badge variant="secondary" className="mt-2">Pending</Badge></div>
                <div className="flex gap-2"><Button size="sm" onClick={() => photoMutation.mutate({ id: photo.id, status: "approved" })}>Approve</Button><Button size="sm" variant="destructive" onClick={() => photoMutation.mutate({ id: photo.id, status: "rejected" })}>Reject</Button></div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 pt-4">
          {reportsQuery.data?.reports.filter((report: any) => report.status === "open").map((report: any) => (
            <Card key={report.id}>
              <CardContent className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div><Badge variant="destructive">Open report</Badge><h3 className="mt-2 font-medium text-white">{report.discussionTitle}</h3><p className="mt-1 text-sm text-muted-foreground">{report.reason}</p></div>
                  <div className="flex gap-2"><Button size="sm" onClick={() => reportMutation.mutate({ id: report.id, status: "resolved" })}>Resolve</Button><Button size="sm" variant="outline" onClick={() => reportMutation.mutate({ id: report.id, status: "dismissed" })}>Dismiss</Button></div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!reportsQuery.data?.reports.some((report: any) => report.status === "open") && <p className="py-8 text-center text-sm text-muted-foreground">No open community reports.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
