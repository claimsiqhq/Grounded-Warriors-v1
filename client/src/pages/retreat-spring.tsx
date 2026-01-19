import { Layout } from "@/components/layout";
import { images, springRetreatHosts } from "@/lib/data";
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

export default function RetreatSpring() {
  const [showModal, setShowModal] = useState(false);
  const retreatDate = new Date("2026-05-01");

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={images.mayColdPlunge} 
              alt="Spring Awakening" 
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
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">May 2026</span>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
                Spring Awakening
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A 4-day deep immersion in the ancient forests of Algonquin Park. The flagship Grounded Warriors experience.
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
                { icon: Calendar, label: "Date", value: "May 1-4, 2026" },
                { icon: MapPin, label: "Location", value: "Algonquin Park, ON" },
                { icon: Users, label: "Group Size", value: "8-12 Men" },
                { icon: Clock, label: "Duration", value: "4 Days" },
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

        {/* Why This Retreat is Different */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Flagship Experience</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-6">Four Days That Will Change Everything</h3>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                Spring Awakening is our most comprehensive retreat. Four days allows for the deeper work — moving past resistance, breaking through old patterns, and returning home fundamentally transformed.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: TreePine,
                  title: "Deep Wilderness",
                  desc: "Algonquin Park offers complete immersion in ancient boreal forest. No roads. No cell service. Just you, the land, and the work."
                },
                {
                  icon: Sunrise,
                  title: "Extended Time",
                  desc: "Four days creates space for the real transformation. Day one breaks down walls. Days two and three do the deep work. Day four integrates."
                },
                {
                  icon: Flame,
                  title: "Advanced Practices",
                  desc: "Extended breathwork journeys. Multiple fire ceremonies. Solo vision time. Practices reserved for those ready to go deeper."
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

        {/* Your Hosts */}
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Your Hosts</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-6">Meet Your Guides</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Four experienced facilitators will hold space for your transformation.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {springRetreatHosts.map((host, i) => (
                <motion.div 
                  key={i} 
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="aspect-square overflow-hidden mb-4 border border-white/10">
                    <img 
                      src={host.image} 
                      alt={host.name} 
                      className="w-full h-full object-cover object-top opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <h4 className="font-serif text-xl text-white mb-1">{host.name}</h4>
                  <p className="text-primary text-sm">{host.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Experience */}
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
                  title: "Lake Immersion",
                  desc: "The spring-fed lakes of Algonquin remain cold even in May. Daily cold water practice in pristine wilderness waters. This is cold immersion at its most sacred."
                },
                {
                  icon: Flame,
                  title: "Nightly Fire Council",
                  desc: "Every evening we gather at the fire. Three nights of ceremony means three opportunities to speak truth, release weight, and witness transformation."
                },
                {
                  icon: Wind,
                  title: "Extended Breathwork",
                  desc: "Longer sessions, deeper journeys. Two-hour breathwork experiences that unlock stored trauma and reconnect you with forgotten parts of yourself."
                },
                {
                  icon: Mountain,
                  title: "Solo Vision Time",
                  desc: "24 hours alone in the forest. Fasting. Sitting with yourself. This ancient practice is where the deepest insights emerge."
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

        {/* The Journey */}
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto max-w-4xl">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Journey</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-white">Four Days of Transformation</h3>
            </motion.div>

            <div className="space-y-12">
              {[
                {
                  day: "Day 1 — Friday",
                  title: "Arrival & Opening",
                  desc: "Arrive between 10-11 AM. Land on the property. Meet your brothers. Opening circle and first fire ceremony. Begin to let go of the world you left behind."
                },
                {
                  day: "Day 2 — Saturday",
                  title: "Breaking Ground",
                  desc: "First cold immersion. Deep breathwork journey. The walls start to crack. Evening fire work goes deeper as trust builds between men."
                },
                {
                  day: "Day 3 — Sunday",
                  title: "The Descent",
                  desc: "The heart of the retreat. Extended solo time in nature. This is where you meet yourself without distraction. Evening integration circle and final fire ceremony."
                },
                {
                  day: "Day 4 — Monday",
                  title: "Integration & Return",
                  desc: "Morning practice. Integration teaching — how to bring this work home. Final circle. Return to base camp between 11 AM - 1 PM. Depart between 2-4 PM, changed."
                },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-8"
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
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Investment</h2>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-4">$2,500 All-Inclusive</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Secure your spot with a $250 deposit. Remaining balance due 30 days before retreat. Payment plans available.
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "4 days / 3 nights wilderness accommodation",
                  "All meals (organic, locally sourced)",
                  "Daily cold water immersion",
                  "3 fire ceremonies",
                  "Extended breathwork sessions",
                  "Solo time in nature",
                  "Men's circle facilitation",
                  "Pre-retreat preparation call",
                  "Preparation materials & reading",
                  "Post-retreat integration call",
                  "Lifetime community membership",
                  "Alumni retreat discounts",
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
        <section className="py-24 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto max-w-3xl">
            <motion.div {...fadeIn} className="text-center mb-12">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Is This For You?</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-white">Spring Awakening is For Men Who...</h3>
            </motion.div>

            <div className="space-y-4">
              {[
                "Feel ready for a significant shift in their life",
                "Want to go deeper than a weekend allows",
                "Are drawn to wilderness and solitude",
                "Have done some personal work but want more",
                "Crave genuine connection with other men",
                "Are willing to be uncomfortable in service of growth",
                "Can commit to four days away from their regular life",
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
        <section className="py-24 bg-background">
          <div className="container px-6 mx-auto text-center">
            <motion.div {...fadeIn}>
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">
                The Forest is Calling
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                Five days in Algonquin. No phone. No agenda. Just you, the elements, and a circle of men ready to do the work.
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
          retreatTitle="Spring Awakening"
          depositAmount={250}
          fullAmount={2500}
        />
      )}
    </Layout>
  );
}
