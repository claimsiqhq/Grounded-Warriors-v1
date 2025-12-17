import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to subscribe");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the Circle",
        description: "You'll receive updates on upcoming retreats.",
      });
      setEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none flex-1"
        disabled={subscribeMutation.isPending}
        required
        data-testid="input-newsletter-email"
      />
      <Button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest px-8 h-12"
        disabled={subscribeMutation.isPending}
        data-testid="button-newsletter-subscribe"
      >
        {subscribeMutation.isPending ? "..." : "Subscribe"}
      </Button>
    </form>
  );
}
