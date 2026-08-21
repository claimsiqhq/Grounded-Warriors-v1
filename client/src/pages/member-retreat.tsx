import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/react";
import { apiRequest } from "@/lib/queryClient";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle, Plus, Loader2, User, Lock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

interface RetreatInfo {
  id: number;
  name: string;
  date: string;
  isPast: boolean;
}

export default function MemberRetreat() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const isAuthenticated = isLoaded && isSignedIn && !!user;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const retreatId = parseInt(params.id || "0", 10);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const accessQuery = useQuery({
    queryKey: ["/api/retreats", retreatId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/retreats/${retreatId}`);
      return res.json() as Promise<{
        retreat: RetreatInfo;
        canAccess: boolean;
        isStaff: boolean;
        isAdmin: boolean;
      }>;
    },
    enabled: isAuthenticated && !!retreatId,
  });

  const canAccess = accessQuery.data?.canAccess ?? false;
  const retreat = accessQuery.data?.retreat;

  const discussionsQuery = useQuery({
    queryKey: ["/api/discussions", { retreatId }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/discussions?retreatId=${retreatId}`);
      return res.json();
    },
    enabled: isAuthenticated && canAccess,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/discussions", {
        ...data,
        retreatId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", { retreatId }] });
      setShowNewPost(false);
      setNewTitle("");
      setNewContent("");
      toast({ title: "Posted", description: "Your post is shared with the brothers in this container." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (!isLoaded || accessQuery.isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <h2 className="font-serif text-2xl text-white mb-4">Members Only</h2>
              <p className="text-muted-foreground mb-6">Please log in to enter the retreat container.</p>
              <Button asChild className="bg-primary">
                <Link href="/sign-in" data-testid="button-login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!retreat) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <h2 className="font-serif text-2xl text-white mb-4">Retreat not found</h2>
              <Button asChild variant="outline">
                <Link href="/member">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!canAccess) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Lock className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h2 className="font-serif text-2xl text-white mb-2">Closed Container</h2>
              <p className="text-muted-foreground mb-6">
                This space is private to brothers who attended <span className="text-white">{retreat.name}</span> ({retreat.date}). If you were there and don't see it, reach out to John or Brian.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href="/member">Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link href="/member/discussions">General Commons</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newContent.trim()) {
      createMutation.mutate({ title: newTitle, content: newContent });
    }
  };

  const discussions = discussionsQuery.data?.discussions || [];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="pt-32 pb-12 bg-gradient-to-b from-card to-background">
          <div className="container px-6 mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Link href="/member" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-primary text-xs uppercase tracking-[0.3em] font-semibold">
                  Private Container
                </span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight mb-2" data-testid="text-retreat-name">
                {retreat.name}
              </h1>
              <p className="text-muted-foreground" data-testid="text-retreat-date">{retreat.date}</p>

              <div className="flex flex-wrap gap-3 mt-6">
                <Button asChild variant="outline" size="sm">
                  <Link href="/member/discussions" data-testid="link-general-commons">
                    <Users className="w-4 h-4 mr-2" />
                    Visit General Commons
                  </Link>
                </Button>
                {accessQuery.data?.isAdmin && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin" data-testid="link-admin">Manage Staff</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* New post + list */}
        <section className="pb-24">
          <div className="container px-6 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-white">Container Discussions</h2>
              <Button onClick={() => setShowNewPost((s) => !s)} className="gap-2" data-testid="button-new-post">
                <Plus className="w-4 h-4" /> New Post
              </Button>
            </div>

            {showNewPost && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Share with this container</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      placeholder="Title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-background"
                      data-testid="input-discussion-title"
                    />
                    <Textarea
                      placeholder="What needs to be said in this circle?"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={5}
                      className="bg-background"
                      data-testid="input-discussion-content"
                    />
                    <div className="flex gap-3">
                      <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-discussion">
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowNewPost(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {discussionsQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : discussions.length > 0 ? (
              <div className="space-y-4">
                {discussions.map((d: any) => (
                  <motion.div key={d.id} {...fadeIn}>
                    <Link href={`/member/discussions/${d.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer" data-testid={`card-discussion-${d.id}`}>
                        <CardContent className="py-6">
                          <div className="flex items-start gap-4">
                            {d.userImage ? (
                              <img src={d.userImage} alt={d.userName} className="w-10 h-10 rounded-full" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-lg mb-1">{d.title}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{d.content}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{d.userName}</span>
                                <span>{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-white mb-2">Quiet in here</h3>
                  <p className="text-muted-foreground mb-4">Be the first to break the silence in this container.</p>
                  <Button onClick={() => setShowNewPost(true)}>Start a Post</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
