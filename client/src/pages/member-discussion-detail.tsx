import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Flag, Heart, Loader2, Pencil, Send, Trash2, User } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { MemberShell } from "@/components/member-shell";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function MemberDiscussionDetail() {
  const params = useParams<{ id: string }>();
  const discussionId = Number(params.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [reply, setReply] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const detailQuery = useQuery<any>({
    queryKey: ["/api/discussions", discussionId],
    queryFn: async () => (await apiRequest("GET", `/api/discussions/${discussionId}`)).json(),
    retry: false,
    refetchInterval: 30_000,
  });
  const meQuery = useQuery<{ user: { id: string; role: string } }>({ queryKey: ["/api/me"] });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/api/discussions", discussionId] });
  const replyMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/discussions/${discussionId}/replies`, { content: reply }),
    onSuccess: () => { setReply(""); refresh(); },
    onError: (error: Error) => toast({ title: "Could not reply", description: error.message, variant: "destructive" }),
  });
  const reactionMutation = useMutation({
    mutationFn: (kind: string) => apiRequest("POST", `/api/discussions/${discussionId}/reactions`, { kind }),
    onSuccess: () => toast({ title: "Response shared" }),
  });
  const editMutation = useMutation({
    mutationFn: () => apiRequest("PUT", `/api/discussions/${discussionId}`, { title: editTitle, content: editContent }),
    onSuccess: () => { setEditing(false); refresh(); toast({ title: "Post updated" }); },
  });
  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/discussions/${discussionId}`),
    onSuccess: () => setLocation(detailQuery.data?.retreat ? `/member/retreats/${detailQuery.data.retreat.id}` : "/member/discussions"),
  });
  const reportMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/discussions/${discussionId}/reports`, { reason: "Please review this post for community safety." }),
    onSuccess: () => toast({ title: "Report sent privately to staff" }),
  });

  if (detailQuery.isLoading) {
    return <MemberShell eyebrow="Community Conversation"><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></MemberShell>;
  }
  if (!detailQuery.data) {
    return <MemberShell eyebrow="Community Conversation"><div className="container mx-auto max-w-3xl px-6 py-16"><Card><CardContent className="p-10 text-center text-muted-foreground">This conversation is unavailable or belongs to another private retreat.</CardContent></Card></div></MemberShell>;
  }

  const { discussion, replies, retreat } = detailQuery.data;
  const owner = meQuery.data?.user.id === discussion.userId;
  const backHref = retreat ? `/member/retreats/${retreat.id}` : "/member/discussions";

  return (
    <MemberShell eyebrow={retreat ? `Private Circle · ${retreat.name}` : "General Commons"}>
      <div className="container mx-auto max-w-3xl px-6 py-10">
        <Link href={backHref} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to the circle</Link>
        <Card className="border-primary/15">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10"><User className="h-5 w-5 text-primary" /></div>
              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <Input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={160} />
                    <Textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={6} maxLength={10000} />
                    <div className="flex gap-2"><Button onClick={() => editMutation.mutate()}>Save</Button><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button></div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">{discussion.isPinned && <Badge>Pinned</Badge>}<h1 className="font-serif text-3xl text-white">{discussion.title}</h1></div>
                    <p className="mt-2 text-xs text-muted-foreground">{discussion.userName} · {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}{discussion.editedAt ? " · edited" : ""}</p>
                    <p className="mt-5 whitespace-pre-wrap leading-relaxed text-muted-foreground">{discussion.content}</p>
                  </>
                )}
              </div>
            </div>
            {!editing && (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                {["support", "strength", "gratitude"].map((kind) => <Button key={kind} variant="ghost" size="sm" onClick={() => reactionMutation.mutate(kind)}><Heart className="mr-2 h-4 w-4" />{kind}</Button>)}
                {owner && <Button variant="ghost" size="sm" onClick={() => { setEditTitle(discussion.title); setEditContent(discussion.content); setEditing(true); }}><Pencil className="mr-2 h-4 w-4" />Edit</Button>}
                {owner && <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate()}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
                {!owner && <Button variant="ghost" size="sm" onClick={() => reportMutation.mutate()}><Flag className="mr-2 h-4 w-4" />Report</Button>}
              </div>
            )}
          </CardContent>
        </Card>

        <h2 className="mb-4 mt-9 font-serif text-2xl text-white">{replies.length} {replies.length === 1 ? "reply" : "replies"}</h2>
        <div className="space-y-3">
          {replies.map((item: any) => (
            <Card key={item.id} className="bg-card/50"><CardContent className="p-5"><div className="flex items-start gap-3"><User className="mt-1 h-4 w-4 text-primary" /><div><p className="text-sm font-medium text-white">{item.userName}</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.content}</p><p className="mt-2 text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p></div></div></CardContent></Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardContent className="flex gap-3 p-4">
            <Textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={discussion.isLocked ? "This conversation is closed." : "Write a thoughtful reply…"} disabled={discussion.isLocked} maxLength={5000} rows={3} />
            <Button size="icon" className="shrink-0 self-end" disabled={!reply.trim() || replyMutation.isPending || discussion.isLocked} onClick={() => replyMutation.mutate()}><Send className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      </div>
    </MemberShell>
  );
}
