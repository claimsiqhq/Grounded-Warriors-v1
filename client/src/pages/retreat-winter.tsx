import { Layout } from "@/components/layout";
import { images } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { RegistrationModal } from "@/components/registration-modal";
import { Countdown } from "@/components/countdown";
import { Flame, Droplets, Wind, Mountain, Check, Calendar, MapPin, Users, Clock } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function RetreatWinter() {
  const [showModal, setShowModal] = useState(false);
  const retreatDate = new Date("2026-03-06");

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={images.marchIcePlunge} 
              alt="Winter Descent" 
              className="w-full h-full object-cover opacity-50"
              style={{ objectPosition: "center 30%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background" />
          </div>

          <div className="container relative z-10 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">March 6-8, 2026</span>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
                Winter Descent
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A 3-day winter expedition into the cold, the fire, and the frozen Ontario backcountry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => setShowModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none uppercase tracking-widest font-semibold"
                  data-testid="button-reserve-hero"
                >
                  Reserve Your Spot — $250 Deposit
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
                { icon: Calendar, label: "Date", value: "March 6-8, 2026" },
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

        {/* The Experience */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Experience</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-6">What Awaits You</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Winter strips the noise away. Subzero air, frozen lakes, hard ground. The kind of conditions that make a man pay attention.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Droplets,
                  title: "Ice Plunges",
                  desc: "Cut a hole in the ice and drop in. Coached entry, breathing protocol, and a wood-fired sauna waiting for the warm-up. The fastest way to find out what you're made of."
                },
                {
                  icon: Flame,
                  title: "Council Fire",
                  desc: "Long winter nights mean long nights at the fire. Stories, plans, hot food, and the kind of conversation that only happens when it's twenty below outside the canvas."
                },
                {
                  icon: Wind,
                  title: "Breathwork Drills",
                  desc: "Cold-water breathing protocols, recovery work, and conditioning under load. Practical techniques you'll keep using long after the trip is over."
                },
                {
                  icon: Mountain,
                  title: "Winter Travel",
                  desc: "Snowshoe hikes, route-finding, building shelter and fire in winter conditions. The land at its most demanding — and its most beautiful."
                },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="bg-background border border-white/5 p-8"
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

        {/* Why Winter */}
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              <motion.div {...fadeIn}>
                <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Why Winter?</h2>
                <h3 className="font-serif text-3xl md:text-4xl text-white mb-6">
                  The Hardest Season Pays the Best
                </h3>
                <p className="text-muted-foreground leading-loose mb-6">
                  Most men avoid the cold. The ones who go in find out fast what their body, breath, and nerve are actually capable of.
                </p>
                <p className="text-muted-foreground leading-loose mb-6">
                  Subzero air sharpens you. The ice plunge resets you. The fire feels like a reward you actually earned. And the company of men who showed up for it hits different than any other trip of the year.
                </p>
                <p className="text-white font-serif text-xl italic">
                  "In the depth of winter, I finally learned that within me there lay an invincible summer."
                </p>
                <p className="text-primary text-sm mt-2">— Albert Camus</p>
              </motion.div>
              <motion.div {...fadeIn} className="aspect-[4/5] overflow-hidden">
                <img 
                  src={images.marchSnowTraining} 
                  alt="Winter training" 
                  className="w-full h-full object-cover opacity-80"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Investment</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-4">$555 All-Inclusive</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Secure your spot with a $250 deposit. Remaining balance due 30 days before retreat.
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "3 days / 2 nights backcountry lodging",
                  "All meals (hearty, locally sourced)",
                  "Daily ice plunges with coached entry",
                  "Wood-fired sauna",
                  "Council fire each night",
                  "Breathwork & winter skills coaching",
                  "Solo time on the land",
                  "Pre-trip prep packet & gear list",
                  "Post-trip integration call",
                  "Lifetime community access",
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

        {/* Sample Schedule */}
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto max-w-3xl">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Sample Schedule</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-white">A Day at Winter Descent</h3>
            </motion.div>

            <div className="space-y-6">
              {[
                { time: "6:30 AM", activity: "Wake with the sun. Coffee at the fire." },
                { time: "7:00 AM", activity: "Breathwork & movement warm-up" },
                { time: "8:00 AM", activity: "Ice plunge & sauna" },
                { time: "9:00 AM", activity: "Hot communal breakfast" },
                { time: "10:30 AM", activity: "Snowshoe trek / winter skills" },
                { time: "12:30 PM", activity: "Lunch on the trail" },
                { time: "2:00 PM", activity: "Solo time / route work" },
                { time: "4:30 PM", activity: "Optional second plunge" },
                { time: "6:00 PM", activity: "Dinner together" },
                { time: "7:30 PM", activity: "Council fire & stories" },
                { time: "10:00 PM", activity: "Rack out under canvas" },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-6 items-baseline border-b border-white/5 pb-4"
                >
                  <span className="text-primary font-mono text-sm w-24 flex-shrink-0">{item.time}</span>
                  <span className="text-white">{item.activity}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-card border-t border-white/5">
          <div className="container px-6 mx-auto text-center">
            <motion.div {...fadeIn}>
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">
                Ready to Drop In?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                This isn't for everyone. It's for men who want a hard winter trip, the ice plunge, the fire, and a tight crew of brothers to do it with.
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
          retreatTitle="Winter Descent"
          depositAmount={250}
          fullAmount={555}
        />
      )}
    </Layout>
  );
}
