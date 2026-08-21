import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  retreatId: number;
  retreatTitle: string;
  /** 0 disables the deposit option (full payment only, e.g. one-day events). */
  depositAmount: number;
  fullAmount: number;
}

export function RegistrationModal({ 
  isOpen, 
  onClose, 
  retreatId,
  retreatTitle, 
  depositAmount, 
  fullAmount 
}: RegistrationModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const fullPaymentOnly = depositAmount <= 0;
  const [paymentType, setPaymentType] = useState<"deposit" | "full">(
    fullPaymentOnly ? "full" : "deposit",
  );

  const HST_RATE = 0.13;
  const selectedAmount = paymentType === "deposit" ? depositAmount : fullAmount;
  const hstAmount = Math.round(selectedAmount * HST_RATE * 100) / 100;
  const totalAmount = selectedAmount + hstAmount;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Pricing is derived server-side from retreatId + paymentType; the
      // client never sends an amount (it could be tampered with).
      const response = await apiRequest("POST", "/api/checkout", {
        customerEmail: email,
        customerName: name,
        retreatId,
        paymentType,
      });
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
              required
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
              required
              className="bg-background border-white/10 focus:border-primary text-white"
              data-testid="input-registration-email"
            />
          </div>

          {!fullPaymentOnly && (
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
          )}

          <div className="border-t border-white/10 pt-4 space-y-2 text-sm" data-testid="summary-totals">
            <div className="flex justify-between text-muted-foreground">
              <span>{fullPaymentOnly ? "Ticket" : paymentType === "deposit" ? "Deposit" : "Full Payment"}</span>
              <span data-testid="text-subtotal">${selectedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>HST (13%)</span>
              <span data-testid="text-hst">${hstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-semibold">
              <span>Total (CAD)</span>
              <span data-testid="text-total">${totalAmount.toFixed(2)}</span>
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
            {fullPaymentOnly
              ? "Prices in CAD. 13% HST added at checkout. Tickets are non-refundable."
              : "Prices in CAD. 13% HST added at checkout. Deposits are non-refundable. Full payment due 30 days before retreat."}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
