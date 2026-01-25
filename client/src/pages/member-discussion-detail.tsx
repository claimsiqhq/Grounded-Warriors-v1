import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, User, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MemberDiscussionDetail() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams();
  const discussionId = params.id;
  const [replyContent, setReplyContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/discussions", discussionId],
    queryFn: async () => {
      const res = await fetch(`/api/discussions/${discussionId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch discussion");
      return res.json();
    },
    enabled: !!user && !!discussionId,
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/discussions/${discussionId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", discussionId] });
      setReplyContent("");
      toast({ title: "Reply posted!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
    },
  });

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <h2 className="font-serif text-2xl text-white mb-4">Members Only</h2>
              <p className="text-muted-foreground mb-6">Please log in to access the community.</p>
              <Button asChild className="bg-primary">
                <Link href="/login" data-testid="button-login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const { discussion, replies } = data || {};

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      replyMutation.mutate(replyContent);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="pt-32 pb-8 bg-gradient-to-b from-card to-background">
          <div className="container px-6 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Link href="/member/discussions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Discussions
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Discussion */}
        {discussion && (
          <section className="pb-8">
            <div className="container px-6 mx-auto max-w-3xl">
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    {discussion.userImage ? (
                      <img src={discussion.userImage} alt={discussion.userName} className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="font-serif text-2xl text-white mb-2">{discussion.title}</h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="font-medium text-primary">{discussion.userName}</span>
                        <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{discussion.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Replies */}
        <section className="pb-8">
          <div className="container px-6 mx-auto max-w-3xl">
            <h2 className="text-lg font-semibold text-white mb-4">{replies?.length || 0} Replies</h2>
            
            {replies?.length > 0 ? (
              <div className="space-y-4 mb-8">
                {replies.map((reply: any) => (
                  <Card key={reply.id} data-testid={`card-reply-${reply.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        {reply.userImage ? (
                          <img src={reply.userImage} alt={reply.userName} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-medium text-white">{reply.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mb-8">No replies yet. Be the first to respond!</p>
            )}

            {/* Reply Form */}
            <Card>
              <CardContent className="py-4">
                <form onSubmit={handleReply} className="flex gap-3">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={2}
                    className="bg-background flex-1"
                    data-testid="input-reply"
                  />
                  <Button type="submit" disabled={replyMutation.isPending} className="self-end" data-testid="button-submit-reply">
                    {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}
