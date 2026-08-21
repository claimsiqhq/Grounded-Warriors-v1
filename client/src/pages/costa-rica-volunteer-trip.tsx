import { Layout } from "@/components/layout";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/data";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  Clock,
  HeartHandshake,
  MapPin,
  Plane,
  Stethoscope,
  Users,
} from "lucide-react";
import { Link } from "wouter";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

export default function CostaRicaVolunteerTrip() {
  return (
    <Layout>
      <Seo
        title="Costa Rica Volunteer Trip — December 2026 | Grounded Warriors"
        description="Join Grounded Warriors in Costa Rica to help build a community pharmacy in Upala, then spend time on the Caribbean coast. A seven-day trip planned for the second week of December 2026."
        path="/retreats/costa-rica-volunteer-trip"
      />

      <main className="min-h-screen bg-background">
        <section className="relative min-h-[660px] overflow-hidden pt-32 pb-20 flex items-center">
          <img
            src={images.hiking}
            alt="Mist-covered tropical forest landscape"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/60 to-background" />
          <div className="container relative z-10 mx-auto px-6">
            <motion.div {...fadeIn} className="max-w-4xl">
              <span className="mb-5 block text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                Second week of December 2026 · 7 days
              </span>
              <h1 className="mb-7 font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
                Build Something
                <br />
                That Lasts.
              </h1>
              <p className="max-w-2xl text-xl leading-relaxed text-white/75 md:text-2xl">
                A volunteer trip to Upala, Costa Rica—helping build a community pharmacy, then closing out the week together on the Caribbean Sea.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="rounded-none bg-primary px-8 py-6 text-base font-semibold uppercase tracking-widest text-primary-foreground hover:bg-white hover:text-black"
                    data-testid="button-costa-rica-interest-hero"
                  >
                    Express Interest
                  </Button>
                </Link>
                <a href="#trip-details">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-none border-white/30 px-8 py-6 text-base uppercase tracking-widest text-white hover:bg-white hover:text-black"
                  >
                    View the Trip
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="trip-details" className="border-y border-white/5 bg-card py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { icon: Calendar, label: "When", value: "2nd week of December" },
                { icon: MapPin, label: "Where", value: "Upala + Caribbean coast" },
                { icon: Clock, label: "Duration", value: "7 days" },
                { icon: Users, label: "Trip Cost", value: "$3,000 CAD" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 text-primary">
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">{item.label}</p>
                  <p className="font-serif text-lg text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 md:grid-cols-2">
              <motion.div {...fadeIn}>
                <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.3em] text-primary">The Project</span>
                <h2 className="mb-6 font-serif text-4xl text-white md:text-5xl">A community pharmacy in Upala.</h2>
                <p className="mb-6 leading-loose text-muted-foreground">
                  In a remote community in Upala, families often have to travel to collect the prescription medication they need after doctor visits. The cost of that trip can be out of reach.
                </p>
                <p className="leading-loose text-muted-foreground">
                  Together with the community, we will support the first stages of building a pharmacy within the health centre—a permanent space for storing and distributing medication closer to home.
                </p>
              </motion.div>
              <motion.div {...fadeIn} className="border border-primary/20 bg-card p-9 md:p-11">
                <Stethoscope className="mb-6 h-10 w-10 text-primary" strokeWidth={1.25} />
                <h3 className="mb-5 font-serif text-3xl text-white">Your work matters here.</h3>
                <ul className="space-y-4 text-white/75">
                  {[
                    "Meet local mothers, children, and community leaders.",
                    "Take part in site preparation and early construction work.",
                    "Support educational and community activities.",
                    "Learn the story of a community building its own future.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-card py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-5xl">
              <motion.div {...fadeIn} className="mb-12 max-w-2xl">
                <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.3em] text-primary">The Week</span>
                <h2 className="font-serif text-4xl text-white md:text-5xl">Work hard. Then take it in.</h2>
              </motion.div>
              <div className="grid gap-5 md:grid-cols-2">
                <motion.div {...fadeIn} className="border border-white/10 bg-background p-8">
                  <HeartHandshake className="mb-5 h-8 w-8 text-primary" strokeWidth={1.25} />
                  <p className="mb-2 text-xs uppercase tracking-widest text-primary">Days 1–4 or 5</p>
                  <h3 className="mb-3 font-serif text-3xl text-white">Volunteer in Upala</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Four to five days alongside the community: meaningful project work, connection, and the rural Costa Rican landscape.
                  </p>
                </motion.div>
                <motion.div {...fadeIn} className="border border-white/10 bg-background p-8">
                  <MapPin className="mb-5 h-8 w-8 text-primary" strokeWidth={1.25} />
                  <p className="mb-2 text-xs uppercase tracking-widest text-primary">Remaining 2–3 days</p>
                  <h3 className="mb-3 font-serif text-3xl text-white">Caribbean coast</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Two to three days at an Airbnb on Costa Rica&apos;s Caribbean Sea side. Accommodation details will be confirmed with the final itinerary.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6">
            <motion.div {...fadeIn} className="mx-auto grid max-w-5xl gap-10 border border-primary/25 bg-primary/10 p-9 md:grid-cols-[1fr_auto] md:items-center md:p-12">
              <div>
                <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.3em] text-primary">Investment & logistics</span>
                <h2 className="mb-4 font-serif text-4xl text-white">$3,000 CAD per person</h2>
                <p className="max-w-2xl leading-relaxed text-white/75">
                  A $500 CAD deposit will reserve your spot. All in-country trip logistics are covered while we are there. Flights are not included. Final travel dates and Caribbean accommodation details will be shared with the group before booking opens.
                </p>
              </div>
              <div className="flex items-center gap-3 border-l-0 border-white/15 pt-3 text-sm text-muted-foreground md:border-l md:pl-8 md:pt-0">
                <Plane className="h-5 w-5 text-primary" />
                <span>Flights not included</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container mx-auto px-6 text-center">
            <motion.div {...fadeIn} className="mx-auto max-w-2xl">
              <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.3em]">Second week of December 2026</span>
              <h2 className="mb-6 font-serif text-4xl md:text-5xl">Want to be part of it?</h2>
              <p className="mb-9 text-lg leading-relaxed opacity-80">
                We&apos;re gathering the crew now. Reach out to receive the confirmed itinerary and booking information when they&apos;re ready.
              </p>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="rounded-none bg-background px-8 py-6 uppercase tracking-widest text-white hover:bg-white hover:text-black"
                  data-testid="button-costa-rica-interest"
                >
                  Express Interest
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </Layout>
  );
}