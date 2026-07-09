import { Layout } from "@/components/layout";
import { Seo } from "@/components/seo";
import { images } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { RegistrationModal } from "@/components/registration-modal";
import { Countdown } from "@/components/countdown";
import { Flame, Droplets, Wind, Mountain, Check, Calendar, MapPin, Users, Clock, TreePine, Sunrise } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

// Keep in sync with server/retreats.ts (id 3 — canonical pricing lives there).
const RETREAT_ID = 3;
const DEPOSIT_AMOUNT = 250;
const FULL_AMOUNT = 499;

export default function RetreatEquinox() {
  const [showModal, setShowModal] = useState(false);
  const retreatDate = new Date("2026-10-09");

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Equinox Gathering",
    description:
      "A 3-day autumn gathering for men on the land in Marmora, Ontario. Cold lake plunges, wood-fired sauna, breathwork, and council fires.",
    startDate: "2026-10-09",
    endDate: "2026-10-11",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Marmora, Ontario",
      address: { "@type": "PostalAddress", addressLocality: "Marmora", addressRegion: "ON", addressCountry: "CA" },
    },
    organizer: { "@type": "Organization", name: "Grounded Warriors" },
    offers: {
      "@type": "Offer",
      price: FULL_AMOUNT,
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <Layout>
      <Seo
        title="Equinox Gathering — October 2026 | Grounded Warriors"
        description="A 3-day autumn retreat for men in Marmora, Ontario. October 9–11, 2026. Cold lake plunges, wood-fired sauna, breathwork, and council fires. $499 all-inclusive."
        path="/retreats/equinox-gathering"
        jsonLd={eventJsonLd}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={images.driftwoodForest}
              alt="Equinox Gathering - Autumn forest path in Ontario"
              className="w-full h-full object-cover opacity-50"
              style={{ objectPosition: "center 40%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background" />
          </div>

          <div className="container relative z-10 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">October 9 – 11, 2026</span>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
                Equinox Gathering
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A 3-day autumn gathering for men on the land in Marmora, Ontario. Cold water, fire, and a crew worth standing beside.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none uppercase tracking-widest font-semibold"
                  data-testid="button-reserve-hero"
                >
                  Reserve Your Spot — ${DEPOSIT_AMOUNT} Deposit
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Countdown */}
        <section className="py-16 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto text-center">
            <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-6 font-semibold">Retreat Begins In</h2>
            <Countdown targetDate={retreatDate} />
          </div>
        </section>

        {/* Quick Details */}
        <section className="py-20 bg-background">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Calendar, label: "Date", value: "Oct 9 – 11, 2026" },
                { icon: MapPin, label: "Location", value: "Marmora, ON" },
                { icon: Users, label: "Group Size", value: "8-12 Men" },
                { icon: Clock, label: "Duration", value: "3 Days" },
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
          </div>
        </section>

        {/* Why This Retreat */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              <motion.div {...fadeIn}>
                <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Turning of the Season</h2>
                <h3 className="font-serif text-3xl md:text-4xl text-white mb-6">
                  Meet the Fall Head-On
                </h3>
                <p className="text-muted-foreground leading-loose mb-6">
                  The equinox is the hinge of the year — equal parts light and dark. It's the right weekend to step out of the noise, get on the land with a crew of good men, and take stock of where you stand before winter comes.
                </p>
                <p className="text-white font-serif text-xl mb-6">
                  Three days. Cold water. Big fires. Real talk.
                </p>
                <p className="text-muted-foreground leading-loose">
                  Based on the land in Marmora, Ontario: lake plunges as the water turns cold, wood-fired sauna, breathwork drills, forest time, and long nights at the council fire. No phones, no agenda, no posturing.
                </p>
              </motion.div>
              <motion.div {...fadeIn} className="aspect-[4/5] overflow-hidden">
                <img
                  src={images.julyGroupForest}
                  alt="The crew gathered in the Marmora forest"
                  className="w-full h-full object-cover opacity-80"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-12">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Land</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-white">A Glimpse of What Awaits</h3>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {[
                { src: images.julyLakeSauna, alt: "Lakeside wood-fired sauna" },
                { src: images.julyColdPlunge, alt: "Cold plunge in the lake" },
                { src: images.julyTipi, alt: "Tipi on the land at Marmora" },
                { src: images.julyCommunalMeal, alt: "Communal meal with the crew" },
                { src: images.coldPlungeCelebration, alt: "Celebrating after a cold plunge" },
                { src: images.fireBuildingPrep, alt: "Fire building practice" },
                { src: images.groundingOutdoors, alt: "Grounding practice outdoors" },
                { src: images.manByFire, alt: "Man tending the fire at night" },
              ].map((photo, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.05 }}
                  className={`overflow-hidden ${i === 0 || i === 5 ? 'col-span-2 row-span-2' : ''}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity aspect-square"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Elements */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Elements</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-6">What Awaits You</h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Droplets,
                  title: "Cold Lake Plunges",
                  desc: "October water in Ontario doesn't negotiate. Daily plunges with coached entry and breathwork — then the wood-fired sauna to bring you back."
                },
                {
                  icon: Flame,
                  title: "Council Fire",
                  desc: "Two long nights at the fire. Stories, plans, and the kind of conversation men only have when the phones are off and the stars are out."
                },
                {
                  icon: Wind,
                  title: "Breathwork Drills",
                  desc: "Practical protocols for cold-water entry, stress under load, and recovery. Tools you'll keep using every day back home."
                },
                {
                  icon: Mountain,
                  title: "Forest & Land Work",
                  desc: "Hikes through autumn forest, fire-craft, and solo time on the land as the season turns. The oldest reset known to man."
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-white/5 p-8"
                >
                  <div className="w-12 h-12 mb-6 rounded-full border border-primary/20 flex items-center justify-center text-primary">
                    <item.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-2xl text-white mb-3">{item.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Weekend */}
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto max-w-4xl">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Weekend</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-white">Three Days on the Land</h3>
            </motion.div>

            <div className="space-y-12">
              {[
                {
                  day: "Day 1 — Friday",
                  title: "Arrival & First Fire",
                  desc: "Arrive late afternoon. Land tour, camp setup, first cold plunge before dark. Opening council fire under the October sky."
                },
                {
                  day: "Day 2 — Saturday",
                  title: "The Full Day",
                  desc: "Sunrise breathwork and plunge. Forest work, fire-craft, and sauna rounds through the day. Solo time on the land in the afternoon. The deepest council fire of the trip after dark."
                },
                {
                  day: "Day 3 — Sunday",
                  title: "Close & Depart",
                  desc: "Final morning practice and plunge. Closing circle, commitments for the season ahead. Depart early afternoon, sharper than you arrived."
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 md:gap-8"
                >
                  <div>
                    <span className="text-primary font-serif text-2xl">{item.day}</span>
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
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Investment</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-4">${FULL_AMOUNT} All-Inclusive</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Secure your spot with a ${DEPOSIT_AMOUNT} deposit. Remaining balance due 30 days before the retreat. Prices plus 13% HST.
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "3 days / 2 nights on the land",
                  "All meals (hearty, locally sourced)",
                  "Daily cold lake plunges",
                  "Wood-fired sauna sessions",
                  "Nightly council fires",
                  "Breathwork & fire-craft coaching",
                  "Solo time on the land",
                  "Pre-trip preparation call & gear list",
                  "Lifetime community membership",
                  "Alumni discounts on future expeditions",
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
                Reserve Your Spot
              </Button>
              <p className="text-muted-foreground text-sm mt-4">
                Only 12 spots available. Deposits are non-refundable.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto max-w-3xl">
            <motion.div {...fadeIn} className="text-center mb-12">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Is This For You?</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-white">The Equinox Gathering is For Men Who...</h3>
            </motion.div>

            <div className="space-y-4">
              {[
                "Want a real weekend in the elements, not a wellness retreat",
                "Are drawn to cold water, open fire, and hard resets",
                "Want to take stock before the winter and set the season's course",
                "Are looking for a tight crew of capable men",
                "Can commit to three days completely off the grid",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 py-3 border-b border-white/5"
                >
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-white text-lg">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto text-center">
            <motion.div {...fadeIn}>
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">
                The Season is Turning
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                Three days in Marmora. No phone. No agenda. Just the land, the cold water, the fire, and a crew of men ready to meet the fall head-on.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none uppercase tracking-widest font-semibold"
                >
                  Reserve Your Spot
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
          retreatTitle="Equinox Gathering"
          depositAmount={DEPOSIT_AMOUNT}
          fullAmount={FULL_AMOUNT}
        />
      )}
    </Layout>
  );
}
