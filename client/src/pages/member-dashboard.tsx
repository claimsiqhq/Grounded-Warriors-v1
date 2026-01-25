import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, Settings, MessageCircle, Loader2 } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function MemberDashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: registrationsData } = useQuery({
    queryKey: ["/api/member/registrations"],
    queryFn: async () => {
      const res = await fetch("/api/member/registrations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch registrations");
      return res.json();
    },
    enabled: !!user,
  });

  if (authLoading) {
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
              <p className="text-muted-foreground mb-6">Please log in to access the member portal.</p>
              <Button asChild className="bg-primary">
                <a href="/api/login" data-testid="button-login">Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const firstName = user.firstName || user.email?.split('@')[0] || 'Warrior';

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-b from-card to-background">
          <div className="container px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex items-center gap-6"
            >
              {user.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt={firstName}
                  className="w-20 h-20 rounded-full border-2 border-primary"
                />
              )}
              <div>
                <span className="text-primary text-sm uppercase tracking-[0.3em] mb-2 block font-semibold">Member Portal</span>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight">
                  Welcome back, {firstName}
                </h1>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12">
          <div className="container px-6 mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
                <Link href="/member/discussions">
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full" data-testid="card-discussions">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Community</CardTitle>
                        <p className="text-sm text-muted-foreground">Connect with others</p>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
                <Link href="/member/resources">
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full" data-testid="card-resources">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Resources</CardTitle>
                        <p className="text-sm text-muted-foreground">Preparation guides</p>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
                <Link href="/retreats">
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full" data-testid="card-retreats">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Retreats</CardTitle>
                        <p className="text-sm text-muted-foreground">Upcoming events</p>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
                <Link href="/team">
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full" data-testid="card-team">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Your Guides</CardTitle>
                        <p className="text-sm text-muted-foreground">Meet the team</p>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* My Retreats */}
        <section className="py-12">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn}>
              <h2 className="font-serif text-2xl text-white mb-6">My Retreats</h2>
              {registrationsData?.registrations?.length > 0 ? (
                <div className="grid gap-4">
                  {registrationsData.registrations.map((reg: any) => (
                    <Card key={reg.id} data-testid={`card-registration-${reg.id}`}>
                      <CardContent className="flex items-center justify-between py-4">
                        <div>
                          <h3 className="font-semibold text-white">{reg.retreatName}</h3>
                          <p className="text-sm text-muted-foreground">{reg.retreatDate}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          reg.paymentStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                          reg.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {reg.paymentStatus}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">You haven't registered for any retreats yet.</p>
                    <Button asChild>
                      <Link href="/retreats" data-testid="button-browse-retreats">Browse Retreats</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="py-12 pb-24">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn}>
              <Button variant="outline" asChild data-testid="button-logout">
                <a href="/api/logout">Log Out</a>
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
