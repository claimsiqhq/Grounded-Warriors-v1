import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle, Plus, Loader2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function MemberDiscussions() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const isAuthenticated = isLoaded && isSignedIn && !!user;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const { data: discussionsData, isLoading } = useQuery<{
    discussions: Array<{
      id: number;
      userImage: string | null;
      userName: string;
      title: string;
      content: string;
      createdAt: string;
    }>;
  }>({
    queryKey: ["/api/discussions"],
    enabled: isAuthenticated,
  });
  const discussions = discussionsData?.discussions ?? [];

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/discussions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      setShowNewPost(false);
      setNewTitle("");
      setNewContent("");
      toast({ title: "Posted!", description: "Your discussion has been created." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (!isLoaded) {
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
              <p className="text-muted-foreground mb-6">Please log in to access the community.</p>
              <Button asChild className="bg-primary">
                <Link href="/sign-in" data-testid="button-login">Log In</Link>
              </Button>
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

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="pt-32 pb-12 bg-gradient-to-b from-card to-background">
          <div className="container px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Link href="/member" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-primary text-sm uppercase tracking-[0.3em] mb-2 block font-semibold">All Members</span>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight">
                    General Commons
                  </h1>
                  <p className="text-muted-foreground mt-2 max-w-xl text-sm">
                    Open ground for all members. For private retreat conversations, enter your retreat container from the dashboard.
                  </p>
                </div>
                <Button onClick={() => setShowNewPost(!showNewPost)} className="gap-2" data-testid="button-new-post">
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* New Post Form */}
        {showNewPost && (
          <section className="pb-8">
            <div className="container px-6 mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Start a Discussion</CardTitle>
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
                      placeholder="Share your thoughts..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={4}
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
            </div>
          </section>
        )}

        {/* Discussions List */}
        <section className="py-8 pb-24">
          <div className="container px-6 mx-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : discussions.length > 0 ? (
              <div className="space-y-4" data-testid="discussions-loaded">
                {discussions.map((discussion) => (
                  <motion.div key={discussion.id} {...fadeIn}>
                    <Link href={`/member/discussions/${discussion.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer" data-testid={`card-discussion-${discussion.id}`}>
                        <CardContent className="py-6">
                          <div className="flex items-start gap-4">
                            {discussion.userImage ? (
                              <img src={discussion.userImage} alt={discussion.userName} className="w-10 h-10 rounded-full" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-lg mb-1">{discussion.title}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{discussion.content}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{discussion.userName}</span>
                                <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
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
              <Card data-testid="discussions-loaded">
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-white mb-2">No discussions yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to start a conversation!</p>
                  <Button onClick={() => setShowNewPost(true)}>Start a Discussion</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
