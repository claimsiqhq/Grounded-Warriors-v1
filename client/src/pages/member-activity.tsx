import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { MemberShell } from "@/components/member-shell";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  href?: string;
  readAt?: string;
  createdAt: string;
}

export default function MemberActivity() {
  const queryClient = useQueryClient();
  const activityQuery = useQuery<{ notifications: Notification[] }>({
    queryKey: ["/api/hub/notifications"],
    refetchInterval: 30_000,
  });
  const readMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/hub/notifications/read"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/hub/notifications"] }),
  });

  return (
    <MemberShell eyebrow="Activity">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <Bell className="mb-4 h-8 w-8 text-primary" />
            <h1 className="font-serif text-4xl text-white">What’s happening</h1>
            <p className="mt-2 text-muted-foreground">Announcements, replies, matches, and photo updates.</p>
          </div>
          <Button variant="outline" onClick={() => readMutation.mutate()} disabled={readMutation.isPending}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        </div>
        {activityQuery.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {activityQuery.data?.notifications.map((item) => {
              const content = (
                <Card className={item.readAt ? "bg-card/40" : "border-primary/25 bg-primary/[0.04]"}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-medium text-white">{item.title}</h2>
                        {item.body && <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>}
                      </div>
                      {!item.readAt && <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
                  </CardContent>
                </Card>
              );
              return item.href ? <Link key={item.id} href={item.href}>{content}</Link> : <div key={item.id}>{content}</div>;
            })}
            {!activityQuery.data?.notifications.length && (
              <Card><CardContent className="py-12 text-center text-muted-foreground">You’re all caught up.</CardContent></Card>
            )}
          </div>
        )}
      </div>
    </MemberShell>
  );
}
