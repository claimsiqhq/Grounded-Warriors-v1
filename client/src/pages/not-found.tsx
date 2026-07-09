import { Layout } from "@/components/layout";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <Seo title="Page Not Found | Grounded Warriors" noindex />
      <div className="pt-32 pb-20 bg-background min-h-screen flex items-center">
        <div className="container px-6 mx-auto text-center max-w-2xl">
          <div className="w-20 h-20 rounded-full border border-primary/20 mx-auto mb-8 flex items-center justify-center">
            <Compass className="w-10 h-10 text-primary" />
          </div>

          <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">404</span>
          <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">
            Off the Trail
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10">
            This page doesn't exist — or it's moved deeper into the backcountry.
            Let's get you back to camp.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                className="bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest px-8 py-6"
                data-testid="button-notfound-home"
              >
                Back to Home
              </Button>
            </Link>
            <Link href="/retreats">
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-none uppercase tracking-widest px-8 py-6"
                data-testid="button-notfound-retreats"
              >
                View Retreats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
