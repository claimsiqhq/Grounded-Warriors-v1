import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import { NewsletterSignup } from "@/components/newsletter";

const DISMISS_KEY = "gw-newsletter-badge-dismissed";

export function FloatingNewsletterBadge() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wasDismissed = window.sessionStorage.getItem(DISMISS_KEY) === "1";
    setDismissed(wasDismissed);
  }, []);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    }
    setOpen(false);
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[min(92vw,360px)] bg-background border border-white/10 shadow-2xl p-6 relative"
            data-testid="panel-floating-newsletter"
          >
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss newsletter"
              data-testid="button-floating-newsletter-dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-white font-serif text-2xl mb-1">Join the Circle</h3>
            <p className="text-white/70 text-sm mb-5 leading-relaxed">
              Quiet updates on upcoming retreats, reflections from the trail,
              and an invitation when registration opens.
            </p>
            <NewsletterSignup />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-white hover:text-black uppercase tracking-widest text-xs font-medium px-5 py-3 shadow-xl border border-white/10"
        aria-expanded={open}
        aria-label={open ? "Close newsletter signup" : "Open newsletter signup"}
        data-testid="button-floating-newsletter"
      >
        <Mail className="h-4 w-4" />
        <span>{open ? "Close" : "Join the Circle"}</span>
      </motion.button>
    </div>
  );
}
