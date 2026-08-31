import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useClerk, useUser } from "@clerk/react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, Settings, MessageCircle, Loader2, Lock, Shield } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function MemberDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const isAuthenticated = isLoaded && isSignedIn;

  const { data: memberData } = useQuery<{
    user: { id: string; role: "member" | "admin" };
  }>({
    queryKey: ["/api/me"],
    enabled: isAuthenticated,
  });

  const { data: registrationsData } = useQuery<{
    registrations: Array<{
      id: number;
      retreatName: string;
      retreatDate: string;
      paymentStatus: string;
    }>;
  }>({
    queryKey: ["/api/member/registrations"],
    enabled: isAuthenticated,
  });

  const { data: myRetreatsData } = useQuery<{
    retreats: { id: number; name: string; date: string; isPast: boolean; isStaff: boolean; isAttendee: boolean }[];
  }>({
    queryKey: ["/api/member/my-retreats"],
    enabled: isAuthenticated,
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
              <p className="text-muted-foreground mb-6">Please log in to access the member portal.</p>
              <Button asChild className="bg-primary">
                <Link href="/sign-in" data-testid="button-login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const email = user.primaryEmailAddress?.emailAddress;
  const firstName = user.firstName || email?.split("@")[0] || "Warrior";
  const registrations = registrationsData?.registrations ?? [];

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
              className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
            >
              {user.imageUrl && (
                <img 
                  src={user.imageUrl}
                  alt={firstName}
                  className="w-20 h-20 rounded-full border-2 border-primary flex-shrink-0"
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
                        <CardTitle className="text-lg">General Commons</CardTitle>
                        <p className="text-sm text-muted-foreground">All members, broader sharing</p>
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

              {memberData?.user.role === "admin" ? (
                <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
                  <Link href="/admin">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full border-primary/30" data-testid="card-admin">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Admin</CardTitle>
                          <p className="text-sm text-muted-foreground">Designate retreat staff</p>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ) : (
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
              )}
            </div>
          </div>
        </section>

        {/* My Retreat Containers */}
        <section className="py-12">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn}>
              <h2 className="font-serif text-2xl text-white mb-2">My Retreat Containers</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Closed circles for the brothers who walked together. Tap to enter.
              </p>
              {myRetreatsData && (
                <div data-testid="member-retreats-loaded">
                  {myRetreatsData.retreats.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {myRetreatsData.retreats.map((r) => (
                        <Link key={r.id} href={`/member/retreats/${r.id}`}>
                          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full" data-testid={`card-container-${r.id}`}>
                            <CardContent className="flex items-center justify-between py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white">{r.name}</h3>
                                  <p className="text-sm text-muted-foreground">{r.date}</p>
                                </div>
                              </div>
                              {r.isStaff && (
                                <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">Staff</span>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-2">No retreat containers yet.</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Containers open up after you register for a retreat or are designated as staff.
                        </p>
                        <Button asChild>
                          <Link href="/retreats" data-testid="button-browse-retreats">Browse Retreats</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Registration receipts */}
        {registrations.length > 0 && (
          <section className="py-6">
            <div className="container px-6 mx-auto">
              <motion.div {...fadeIn}>
                <h2 className="font-serif text-xl text-white mb-4">Registrations</h2>
                <div className="grid gap-3">
                  {registrations.map((reg) => (
                    <Card key={reg.id} data-testid={`card-registration-${reg.id}`}>
                      <CardContent className="flex items-center justify-between py-3">
                        <div>
                          <h3 className="font-medium text-white text-sm">{reg.retreatName}</h3>
                          <p className="text-xs text-muted-foreground">{reg.retreatDate}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ['paid', 'completed', 'deposit_paid'].includes(reg.paymentStatus) ? 'bg-green-500/20 text-green-400' :
                          reg.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {reg.paymentStatus}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Account Actions */}
        <section className="py-12 pb-24">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn}>
              <Button
                variant="outline"
                onClick={() => signOut({ redirectUrl: "/" })}
                data-testid="button-logout"
              >
                Log Out
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
