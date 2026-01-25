import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownProps {
  targetDate: Date;
}

interface MiniCountdownProps extends CountdownProps {
  variant?: "desktop" | "mobile";
}

export function MiniCountdown({ targetDate, variant = "desktop" }: MiniCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (variant === "mobile") {
    return (
      <Link href="/retreats">
        <motion.div 
          className="flex items-center justify-center gap-3 py-2 bg-primary/10 border-b border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
          data-testid="mini-countdown-mobile"
          animate={{
            backgroundColor: [
              "rgba(139, 195, 74, 0.1)",
              "rgba(139, 195, 74, 0.15)",
              "rgba(139, 195, 74, 0.1)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Next Retreat in</span>
          <motion.span 
            className="text-sm font-semibold text-primary"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {timeLeft.days} days, {timeLeft.hours} hours
          </motion.span>
          <span className="text-xs text-primary">→</span>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href="/retreats">
      <motion.div 
        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer group"
        data-testid="mini-countdown-desktop"
        animate={{
          boxShadow: [
            "0 0 0px rgba(139, 195, 74, 0)",
            "0 0 8px rgba(139, 195, 74, 0.4)",
            "0 0 0px rgba(139, 195, 74, 0)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Next Retreat</span>
        <motion.span 
          className="text-sm font-semibold text-primary group-hover:text-white transition-colors"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {timeLeft.days}d {timeLeft.hours}h
        </motion.span>
      </motion.div>
    </Link>
  );
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 md:gap-6 justify-center">
      {[
        { value: timeLeft.days, label: "Days", id: "days" },
        { value: timeLeft.hours, label: "Hours", id: "hours" },
        { value: timeLeft.minutes, label: "Min", id: "minutes" },
        { value: timeLeft.seconds, label: "Sec", id: "seconds" },
      ].map((item) => (
        <div key={item.id} className="text-center">
          <motion.div 
            className="bg-card border border-primary/20 w-20 h-20 md:w-28 md:h-28 flex items-center justify-center relative overflow-hidden"
            animate={{
              boxShadow: [
                "0 0 0px rgba(139, 195, 74, 0)",
                "0 0 15px rgba(139, 195, 74, 0.3)",
                "0 0 0px rgba(139, 195, 74, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={item.value}
                className="font-serif text-3xl md:text-5xl text-white"
                data-testid={`text-countdown-${item.id}`}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {String(item.value).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </motion.div>
          <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest mt-3 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
