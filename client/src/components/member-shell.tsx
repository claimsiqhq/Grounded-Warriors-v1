import type { ReactNode } from "react";
import { useAuth, useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  Bell,
  CircleUserRound,
  Home,
  Loader2,
  MessageCircle,
  Mountain,
  Shield,
  Users,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const links = [
  { href: "/member", label: "Home", icon: Home },
  { href: "/member/alumni", label: "Alumni", icon: Users },
  { href: "/member/discussions", label: "Commons", icon: MessageCircle },
  { href: "/member/activity", label: "Activity", icon: Bell },
  { href: "/member/profile", label: "Profile", icon: CircleUserRound },
];

export function MemberShell({
  children,
  eyebrow = "Retreat Community",
}: {
  children: ReactNode;
  eyebrow?: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [location] = useLocation();
  const memberQuery = useQuery<{ user: { role: "member" | "admin" } }>({
    queryKey: ["/api/me"],
    enabled: Boolean(isLoaded && isSignedIn),
  });

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Layout>
        <div className="container flex min-h-[75vh] items-center justify-center px-6 pt-24">
          <Card className="max-w-md border-primary/20 bg-card/80">
            <CardContent className="p-8 text-center">
              <Mountain className="mx-auto mb-5 h-10 w-10 text-primary" />
              <h1 className="font-serif text-3xl text-white">Enter the circle</h1>
              <p className="mt-3 text-muted-foreground">
                Sign in to access your retreat containers and alumni community.
              </p>
              <Button asChild className="mt-6">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(201,184,150,0.08),transparent_32%),linear-gradient(to_bottom,#17271f,#0f1a14_38%)] pt-24">
        <header className="border-b border-white/5">
          <div className="container mx-auto flex items-end justify-between gap-4 px-6 py-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                {eyebrow}
              </p>
              <p className="font-serif text-2xl text-white">
                Welcome, {user.firstName || "Warrior"}
              </p>
            </div>
            {memberQuery.data?.user.role === "admin" && (
              <Button asChild variant="outline" size="sm">
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
          </div>
        </header>

        <div className="sticky top-16 z-30 border-b border-white/5 bg-background/90 backdrop-blur">
          <nav
            className="container mx-auto flex gap-1 overflow-x-auto px-4 py-2"
            aria-label="Member portal"
          >
            {links.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/member"
                  ? location === href
                  : location.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <main>{children}</main>
      </div>
    </Layout>
  );
}
