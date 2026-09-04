import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2 } from "lucide-react";
import { SITE_CONTACT_EMAIL } from "@/lib/site";
import { apiRequest } from "@/lib/queryClient";

export default function RegistrationSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("order");

  const { data: orderData, isLoading, isError } = useQuery({
    queryKey: ["checkout-order", orderId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/checkout/order/${orderId}`);
      return response.json();
    },
    enabled: !!orderId,
    retry: 2,
    refetchInterval: (query) =>
      query.state.data?.order?.status === "pending" ? 1500 : false,
  });

  const order = orderData?.order;
  const isPaid = order?.status === "paid";

  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container px-6 mx-auto text-center max-w-2xl">
          <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-8 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6" data-testid="text-success-heading">
            {isPaid ? "Your Spot is Reserved" : "Confirming Your Payment"}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            {isPaid
              ? "Thank you for taking this step. We've received your payment and will be in touch soon with next steps and preparation materials."
              : "Stripe is confirming your payment. This page will update automatically."}
          </p>

          {isLoading && (
            <div className="flex items-center justify-center gap-3 text-muted-foreground mb-10" data-testid="loader-session">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading your registration details…</span>
            </div>
          )}

          {(isError || !orderId) && !isLoading && (
            <div className="bg-card border border-white/10 p-6 mb-10 text-muted-foreground" data-testid="text-session-error">
              We couldn't load your registration details right now, but if your
              payment went through your spot is secure. Check your email for a
              confirmation, or contact us if anything looks off.
            </div>
          )}

          {order && (
            <div className="bg-card border border-white/10 p-8 mb-10 text-left">
              <h3 className="font-serif text-xl text-white mb-4">Registration Details</h3>
              <div className="space-y-3 text-muted-foreground">
                {order.retreatName && (
                  <p>
                    <span className="text-primary">Retreat:</span> {order.retreatName}
                  </p>
                )}
                <p>
                  <span className="text-primary">Amount Paid:</span>{" "}
                  ${(order.amount_total / 100).toFixed(2)} {order.currency?.toUpperCase()}
                </p>
                <p>
                  <span className="text-primary">Confirmation:</span> {order.id?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-muted-foreground">
              {isPaid
                ? "A confirmation email is on its way. "
                : ""}
              Create a free Member Portal account with the email you used at
              checkout to unlock your retreat's private container. Questions?
              Reach us at{" "}
              <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="text-primary hover:underline">
                {SITE_CONTACT_EMAIL}
              </a>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/sign-up">
                <Button
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black"
                  data-testid="button-create-account"
                >
                  Create Member Account
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  data-testid="button-back-home"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
