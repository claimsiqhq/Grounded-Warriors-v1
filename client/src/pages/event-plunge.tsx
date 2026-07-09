import { Layout } from "@/components/layout";
import { Seo } from "@/components/seo";
import { images } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { RegistrationModal } from "@/components/registration-modal";
import { Countdown } from "@/components/countdown";
import { Droplets, Wind, Dumbbell, Check, Calendar, MapPin, Users, Clock } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

// Keep in sync with server/retreats.ts (id 7 — canonical pricing lives there).
const RETREAT_ID = 7;
const TICKET_AMOUNT = 150;

export default function EventPlunge() {
  const [showModal, setShowModal] = useState(false);
  const eventDate = new Date("2026-09-12T06:00:00-04:00");

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "GW Train, Breath & Plunge",
    description:
      "A three-hour dawn session of training, coached breathwork, and cold-water immersion with the Grounded Warriors crew in the Toronto/Mississauga area.",
    startDate: "2026-09-12T06:00:00-04:00",
    endDate: "2026-09-12T09:00:00-04:00",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Toronto / Mississauga (details to follow)",
      address: { "@type": "PostalAddress", addressLocality: "Toronto", addressRegion: "ON", addressCountry: "CA" },
    },
    organizer: { "@type": "Organization", name: "Grounded Warriors" },
    offers: {
      "@type": "Offer",
      price: TICKET_AMOUNT,
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <Layout>
      <Seo
        title="Train, Breath & Plunge — September 2026 | Grounded Warriors"
        description="Three hours at dawn: training, coached breathwork, and cold-water immersion. Saturday, September 12, 2026, 6–9 AM, Toronto/Mississauga. $150 + HST."
        path="/events/train-breath-plunge"
        image={images.dawnPlunge}
        jsonLd={eventJsonLd}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={images.dawnPlunge}
              alt="Men doing breathwork at a misty lake shoreline at dawn"
              className="w-full h-full object-cover opacity-50"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background" />
          </div>

          <div className="container relative z-10 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">Saturday, September 12, 2026 · 6–9 AM</span>
              <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                Train, Breath &amp; Plunge
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Three hours at dawn. Move hard, breathe with intent, and meet the cold water head-on — before most of the city is awake.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none uppercase tracking-widest font-semibold"
                  data-testid="button-reserve-hero"
                >
                  Claim Your Spot — ${TICKET_AMOUNT}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Countdown */}
        <section className="py-16 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto text-center">
            <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-6 font-semibold">First Plunge In</h2>
            <Countdown targetDate={eventDate} />
          </div>
        </section>

        {/* Quick Details */}
        <section className="py-20 bg-background">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Calendar, label: "Date", value: "Sat, Sep 12, 2026" },
                { icon: Clock, label: "Time", value: "6:00 – 9:00 AM" },
                { icon: MapPin, label: "Location", value: "Toronto / Mississauga" },
                { icon: Users, label: "Spots", value: "Limited" },
              ].map((item, i) => (
                <motion.div key={i} {...fadeIn} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-primary/20 flex items-center justify-center text-primary">
                    <item.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-white font-serif text-lg">{item.value}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-muted-foreground text-sm mt-8 italic">
              Exact meeting point sent to registered men before the event.
            </p>
          </div>
        </section>

        {/* The Session */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Session</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-6">Three Hours, Three Disciplines</h3>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                This is the core Grounded Warriors protocol — the same training, breathwork, and cold-water practice we run on every expedition, condensed into one dawn session close to home.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Dumbbell,
                  title: "Train",
                  desc: "A full-body outdoor session — bodyweight work, carries, and partner drills. Scaled to the man, never watered down. Come with a base of fitness and a willingness to push."
                },
                {
                  icon: Wind,
                  title: "Breathe",
                  desc: "Coached breathwork protocols for cold exposure, exertion, and recovery — the same techniques used by free-divers and arctic swimmers. Tools you keep for life."
                },
                {
                  icon: Droplets,
                  title: "Plunge",
                  desc: "Cold-water immersion with coached entry, controlled exposure, and proper re-warming. First-timers welcome — you'll be readier than you think."
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-primary/20 flex items-center justify-center text-primary">
                    <item.icon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-2xl text-white mb-3">{item.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Morning */}
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto max-w-4xl">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Morning</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-white">How It Runs</h3>
            </motion.div>

            <div className="space-y-12">
              {[
                {
                  time: "6:00 AM",
                  title: "Muster & Warm-Up",
                  desc: "Arrive in the dark, meet the crew, and get moving. Mobility and activation while the sun comes up over the water."
                },
                {
                  time: "6:30 AM",
                  title: "The Training Block",
                  desc: "A hard outdoor session — carries, bodyweight strength, and partner work. Earn the water."
                },
                {
                  time: "7:45 AM",
                  title: "Breathwork & Plunge",
                  desc: "Coached breathing protocols on the shoreline, then controlled cold-water immersion. Multiple rounds for those who want them."
                },
                {
                  time: "8:30 AM",
                  title: "Hot Drinks & Debrief",
                  desc: "Re-warm, refuel, and close out the morning with the crew. Walk into your Saturday sharper than you've been all year."
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-8"
                >
                  <div>
                    <span className="text-primary font-serif text-2xl">{item.time}</span>
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-white mb-2">{item.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Your Spot</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-4">${TICKET_AMOUNT} Per Man</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                One flat price, plus 13% HST at checkout. Spots are limited so every man gets coached.
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Full 3-hour coached session",
                  "Guided training block",
                  "Breathwork instruction",
                  "Coached cold-water immersion",
                  "Hot drinks and post-session fuel",
                  "Gear list sent before the event",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    {...fadeIn}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-white">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div {...fadeIn} className="text-center mt-12">
              <Button
                size="lg"
                onClick={() => setShowModal(true)}
                className="bg-primary text-primary-foreground hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none uppercase tracking-widest font-semibold"
                data-testid="button-reserve-bottom"
              >
                Claim Your Spot
              </Button>
              <p className="text-muted-foreground text-sm mt-4">
                Tickets are non-refundable but transferable to another man.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto text-center">
            <motion.div {...fadeIn}>
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">
                Meet the Cold Head-On
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                Three hours at dawn that will reset your whole week. Bring your nerve — we'll coach the rest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none uppercase tracking-widest font-semibold"
                >
                  Claim Your Spot — ${TICKET_AMOUNT}
                </Button>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-lg px-10 py-6 rounded-none uppercase tracking-widest font-semibold"
                  >
                    Ask a Question
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {showModal && (
        <RegistrationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          retreatId={RETREAT_ID}
          retreatTitle="GW Train, Breath & Plunge"
          depositAmount={0}
          fullAmount={TICKET_AMOUNT}
        />
      )}
    </Layout>
  );
}
