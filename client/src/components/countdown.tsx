import { useState, useEffect } from "react";
import { Link } from "wouter";

interface CountdownProps {
  targetDate: Date;
}

export function MiniCountdown({ targetDate }: CountdownProps) {
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

  return (
    <Link href="/retreats">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer group">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Next Retreat</span>
        <span className="text-sm font-semibold text-primary group-hover:text-white transition-colors">
          {timeLeft.days}d {timeLeft.hours}h
        </span>
      </div>
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
    <div className="flex gap-4 justify-center">
      {[
        { value: timeLeft.days, label: "Days", id: "days" },
        { value: timeLeft.hours, label: "Hours", id: "hours" },
        { value: timeLeft.minutes, label: "Min", id: "minutes" },
        { value: timeLeft.seconds, label: "Sec", id: "seconds" },
      ].map((item) => (
        <div key={item.id} className="text-center">
          <div className="bg-card border border-white/10 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
            <span className="font-serif text-2xl md:text-3xl text-white" data-testid={`text-countdown-${item.id}`}>{String(item.value).padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-widest mt-2 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
