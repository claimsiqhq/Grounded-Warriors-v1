import { Layout } from "@/components/layout";
import { images, testimonials, retreats } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowDown, Flame, Droplets, Trees, Users } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={images.hero} 
            alt="Forest at twilight" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background" />
        </div>

        <div className="container relative z-10 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <img src={images.logo} alt="Logo" className="w-24 h-auto mx-auto mb-8 opacity-90" />
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight uppercase">
              Transform Through <br className="hidden md:block" /> Descent
            </h1>
            <p className="text-xl md:text-2xl text-primary/80 font-serif italic mb-10 max-w-2xl mx-auto">
              "The way down is the way through."
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/retreats">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-white hover:text-black text-lg px-8 py-6 rounded-none uppercase tracking-widest font-semibold transition-all duration-500">
                  View Retreats
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-6 rounded-none uppercase tracking-widest font-semibold transition-all duration-500">
                  Our Philosophy
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-primary/50 animate-bounce"
        >
          <ArrowDown size={32} />
        </motion.div>
      </section>

      {/* Mission Intro */}
      <section className="py-24 md:py-32 bg-background relative">
        <div className="container px-6 max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-6 font-semibold">The Mission</h2>
            <p className="font-serif text-3xl md:text-4xl leading-relaxed text-white mb-8">
              We are not a bootcamp. We are not here to fix you. <br/>
              We are a space for men to stop performing, drop into their bodies, and reconnect with the ancient wisdom of the earth.
            </p>
            <p className="text-muted-foreground text-lg leading-loose max-w-2xl mx-auto">
              In a world that demands constant ascent—climbing ladders, building empires, achieving more—we offer the counter-intuitive path: descent. Down into the silence. Down into the wound. Down into the grounded strength that has always been waiting for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Elements */}
      <section className="py-24 bg-card border-y border-white/5">
        <div className="container px-6 mx-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
          >
            {[
              { icon: Flame, title: "Fire", desc: "Ceremonial spaces to burn what no longer serves you." },
              { icon: Droplets, title: "Water", desc: "Cold immersion to awaken the nervous system and build resilience." },
              { icon: Trees, title: "Earth", desc: "Deep forest immersion to ground your energy and slow your mind." },
              { icon: Users, title: "Brotherhood", desc: "A circle of men committed to truth, without posturing." }
            ].map((el, i) => (
              <motion.div 
                key={i} 
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <el.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl text-white mb-3">{el.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{el.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Visual Break / Testimonial */}
      <section className="relative py-32 md:py-48 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={images.fire} alt="Fire Ceremony" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        </div>
        <div className="container relative z-10 px-6 max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <p className="font-serif text-3xl md:text-5xl italic text-white leading-tight mb-8">
              "{testimonials[0].text}"
            </p>
            <cite className="text-primary text-sm uppercase tracking-widest not-italic">
              — {testimonials[0].author}
            </cite>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Retreats Preview */}
      <section className="py-24 bg-background">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Upcoming</h2>
              <h3 className="font-serif text-4xl md:text-5xl text-white">Join the Circle</h3>
            </div>
            <Link href="/retreats">
              <Button variant="link" className="text-primary hover:text-white p-0 text-lg group">
                View Full Schedule <span className="group-hover:translate-x-1 transition-transform ml-2">→</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {retreats.map((retreat) => (
              <motion.div 
                key={retreat.id}
                {...fadeIn}
                className="group relative overflow-hidden bg-card border border-white/5 hover:border-primary/20 transition-colors duration-500"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img 
                    src={retreat.image} 
                    alt={retreat.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-primary text-xs uppercase tracking-widest border border-primary/20 px-3 py-1 rounded-full">
                      {retreat.date}
                    </span>
                    <span className="text-muted-foreground text-sm">{retreat.spots} spots left</span>
                  </div>
                  <h4 className="font-serif text-3xl text-white mb-2 group-hover:text-primary transition-colors">{retreat.title}</h4>
                  <p className="text-muted-foreground mb-6">{retreat.location}</p>
                  <div className="flex justify-between items-center border-t border-white/5 pt-6">
                    <span className="text-xl text-white">{retreat.price}</span>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black rounded-none uppercase text-xs tracking-widest">
                      Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
