import { Layout } from "@/components/layout";
import { Seo } from "@/components/seo";
import { images } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { RegistrationModal } from "@/components/registration-modal";
import { Countdown } from "@/components/countdown";
import { Flame, Check, Calendar, MapPin, Users, Clock, UtensilsCrossed, MessageCircle } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

// Keep in sync with server/retreats.ts (id 6 — canonical pricing lives there).
const RETREAT_ID = 6;
const TICKET_AMOUNT = 100;

export default function EventDinner() {
  const [showModal, setShowModal] = useState(false);
  const eventDate = new Date("2026-08-20T18:00:00-04:00");

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Grounded Warriors Men's Dinner",
    description:
      "An evening at the table with the Grounded Warriors crew — hearty food, real conversation, and the brotherhood of the trail brought into the city.",
    startDate: "2026-08-20T18:00:00-04:00",
    endDate: "2026-08-20T21:00:00-04:00",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Toronto — West End (details to follow)",
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
        title="Men's Dinner — August 2026 | Grounded Warriors"
        description="An evening at the table with the Grounded Warriors crew. Thursday, August 20, 2026, 6–9 PM in Toronto's West End. Hearty food and real conversation. $100 + HST."
        path="/events/mens-dinner"
        image={images.mensDinner}
        jsonLd={eventJsonLd}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={images.mensDinner}
              alt="Candle-lit dinner table with the Grounded Warriors crew"
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
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">Thursday, August 20, 2026 · 6–9 PM</span>
              <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                Men's Dinner
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                The brotherhood of the fire, brought to the table. One evening in the city with the crew — no screens, no small talk.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none uppercase tracking-widest font-semibold"
                  data-testid="button-reserve-hero"
                >
                  Reserve Your Seat — ${TICKET_AMOUNT}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Countdown */}
        <section className="py-16 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto text-center">
            <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-6 font-semibold">Dinner Begins In</h2>
            <Countdown targetDate={eventDate} />
          </div>
        </section>

        {/* Quick Details */}
        <section className="py-20 bg-background">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Calendar, label: "Date", value: "Thu, Aug 20, 2026" },
                { icon: Clock, label: "Time", value: "6:00 – 9:00 PM" },
                { icon: MapPin, label: "Location", value: "Toronto, West End" },
                { icon: Users, label: "Seats", value: "Limited" },
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
              Exact venue details sent to registered guests before the event.
            </p>
          </div>
        </section>

        {/* Why */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              <motion.div {...fadeIn}>
                <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Between Expeditions</h2>
                <h3 className="font-serif text-3xl md:text-4xl text-white mb-6">
                  The Fire, Brought Indoors
                </h3>
                <p className="text-muted-foreground leading-loose mb-6">
                  Not every gathering needs a portage. The Men's Dinner is where the crew — trail veterans and men who haven't taken their first plunge yet — sit down at one table over hearty food and talk about what actually matters.
                </p>
                <p className="text-white font-serif text-xl mb-6">
                  One table. One evening. Real conversation.
                </p>
                <p className="text-muted-foreground leading-loose">
                  If you've been curious about Grounded Warriors, this is the lowest-commitment way to meet the men and hear what the expeditions are really like — straight from the guys who've been out there.
                </p>
              </motion.div>
              <motion.div {...fadeIn} className="aspect-[4/5] overflow-hidden">
                <img
                  src={images.mug}
                  alt="Hands holding a metal mug by the fire"
                  className="w-full h-full object-cover opacity-80"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Evening */}
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Evening</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-6">What to Expect</h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: UtensilsCrossed,
                  title: "A Real Meal",
                  desc: "Hearty, simple food done right — the kind of dinner that anchors a long conversation. Dietary needs accommodated; let us know when you register."
                },
                {
                  icon: MessageCircle,
                  title: "Council at the Table",
                  desc: "Same format as the council fire: every man gets the floor, nobody performs. What's said at the table stays at the table."
                },
                {
                  icon: Flame,
                  title: "The Trail Ahead",
                  desc: "Hear what's coming — Marmora in October, the backcountry in 2027 — and meet the guides who'll be leading from the front."
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

        {/* What's Included */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Your Seat</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-4">${TICKET_AMOUNT} Per Man</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                One flat price, plus 13% HST at checkout. Seats are limited and go to the men who claim them first.
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Full dinner — hearty and locally sourced",
                  "Non-alcoholic drinks included",
                  "Council-style conversation at the table",
                  "Meet the guides and the crew",
                  "First look at upcoming expeditions",
                  "Private venue in Toronto's West End",
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
                Reserve Your Seat
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
                Pull Up a Chair
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                One evening. One table. A crew of men worth knowing. Come hungry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none uppercase tracking-widest font-semibold"
                >
                  Reserve Your Seat — ${TICKET_AMOUNT}
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
          retreatTitle="Grounded Warriors Men's Dinner"
          depositAmount={0}
          fullAmount={TICKET_AMOUNT}
        />
      )}
    </Layout>
  );
}
