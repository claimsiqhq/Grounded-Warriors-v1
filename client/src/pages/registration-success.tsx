import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";

export default function RegistrationSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("session_id");

  const { data: sessionData } = useQuery({
    queryKey: ["checkout-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await fetch(`/api/checkout/session/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch session");
      return response.json();
    },
    enabled: !!sessionId,
  });

  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container px-6 mx-auto text-center max-w-2xl">
          <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-8 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6" data-testid="text-success-heading">
            Your Spot is Reserved
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Thank you for taking this step. We've received your deposit and will be in touch soon with next steps and preparation materials.
          </p>

          {sessionData?.session && (
            <div className="bg-card border border-white/10 p-8 mb-10 text-left">
              <h3 className="font-serif text-xl text-white mb-4">Registration Details</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <span className="text-primary">Email:</span> {sessionData.session.customer_email}
                </p>
                <p>
                  <span className="text-primary">Amount Paid:</span>{" "}
                  ${(sessionData.session.amount_total / 100).toFixed(2)} {sessionData.session.currency?.toUpperCase()}
                </p>
                <p>
                  <span className="text-primary">Confirmation:</span> {sessionData.session.id?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-muted-foreground">
              A confirmation email has been sent. If you have any questions, reach out to us at{" "}
              <a href="mailto:bcoones@gmail.com" className="text-primary hover:underline">
                bcoones@gmail.com
              </a>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-testid="button-back-home"
                >
                  Back to Home
                </Button>
              </Link>
              <Link href="/retreats">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black"
                  data-testid="button-view-retreats"
                >
                  View All Retreats
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
