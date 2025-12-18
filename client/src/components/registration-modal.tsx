import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  retreatTitle: string;
  depositAmount: number;
  fullAmount: number;
}

export function RegistrationModal({ 
  isOpen, 
  onClose, 
  retreatTitle, 
  depositAmount, 
  fullAmount 
}: RegistrationModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const amount = paymentType === "deposit" ? depositAmount : fullAmount;
      
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: email,
          customerName: name,
          retreatName: retreatTitle,
          amount: amount,
          paymentType: paymentType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Checkout failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email",
        variant: "destructive",
      });
      return;
    }
    checkoutMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-white">
            Reserve Your Spot
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {retreatTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-primary uppercase tracking-widest text-xs">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="bg-background border-white/10 focus:border-primary text-white"
              data-testid="input-registration-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-primary uppercase tracking-widest text-xs">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-background border-white/10 focus:border-primary text-white"
              data-testid="input-registration-email"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-primary uppercase tracking-widest text-xs">
              Payment Option
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentType("deposit")}
                className={`p-4 border text-left transition-all ${
                  paymentType === "deposit"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 hover:border-white/30"
                }`}
                data-testid="button-payment-deposit"
              >
                <div className="text-primary text-sm mb-1">Deposit</div>
                <div className="text-white font-serif text-xl">${depositAmount}</div>
                <div className="text-muted-foreground text-xs mt-1">Reserve now</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("full")}
                className={`p-4 border text-left transition-all ${
                  paymentType === "full"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 hover:border-white/30"
                }`}
                data-testid="button-payment-full"
              >
                <div className="text-primary text-sm mb-1">Full Payment</div>
                <div className="text-white font-serif text-xl">${fullAmount}</div>
                <div className="text-muted-foreground text-xs mt-1">Pay in full</div>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest py-6"
            disabled={checkoutMutation.isPending}
            data-testid="button-proceed-checkout"
          >
            {checkoutMutation.isPending ? "Processing..." : "Proceed to Payment"}
          </Button>

          <p className="text-muted-foreground text-xs text-center">
            Deposits are non-refundable. Full payment due 30 days before retreat.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
