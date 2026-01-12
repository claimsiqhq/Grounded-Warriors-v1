import { Layout } from "@/components/layout";
import { images, testimonials, retreats, facilitators } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowDown, Flame, Droplets, Wind, Mountain, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Countdown } from "@/components/countdown";
import { NewsletterSignup } from "@/components/newsletter";
import { PageLoader } from "@/components/loading";

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

function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const next = () => goTo((currentIndex + 1) % testimonials.length);
  const prev = () => goTo((currentIndex - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="relative max-w-4xl mx-auto">
      <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
      <div className="overflow-hidden">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="font-serif text-2xl md:text-4xl italic text-white leading-tight mb-8">
            "{testimonials[currentIndex].text}"
          </p>
          <cite className="text-primary text-sm uppercase tracking-widest not-italic">
            — {testimonials[currentIndex].author}
          </cite>
        </motion.div>
      </div>

      <div className="flex justify-center gap-3 mt-10">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? "bg-primary w-6" : "bg-white/20 hover:bg-white/40"
            }`}
            data-testid={`testimonial-dot-${i}`}
          />
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 text-white/40 hover:text-white transition-colors"
        data-testid="testimonial-prev"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 text-white/40 hover:text-white transition-colors"
        data-testid="testimonial-next"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
}

function ParallaxSection({ image, children, speed = 0.5 }: { image: string; children: React.ReactNode; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 -top-[20%] -bottom-[20%]"
      >
        <img src={image} alt="" className="w-full h-full object-cover opacity-40" />
      </motion.div>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const nextRetreatDate = new Date("2026-03-01");

  return (
    <Layout>
      {isLoading && <PageLoader />}
      
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: heroY }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={images.hero} 
            alt="Forest at twilight" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background" />
        </motion.div>

        <motion.div 
          style={{ opacity: heroOpacity }}
          className="container relative z-10 px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <img src={images.logo} alt="Logo" className="w-24 h-auto mx-auto mb-8 opacity-90" />
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Return to the Elements.<br />Return to Yourself.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              Grounded Warriors is a primal retreat experience for men who are ready to step out of performance, reconnect with their bodies, and remember what it feels like to be fully alive.
            </p>
            <p className="text-primary/80 font-serif italic mb-10 max-w-xl mx-auto">
              Rooted in nature. Guided by the elements. Held in brotherhood.
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
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-primary/50 animate-bounce"
        >
          <ArrowDown size={32} />
        </motion.div>
      </section>

      {/* Our Philosophy */}
      <section className="py-24 md:py-32 bg-background relative">
        <div className="container px-6 max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-6 font-semibold">Our Philosophy</h2>
            <h3 className="font-serif text-3xl md:text-4xl leading-relaxed text-white mb-8">
              This Is Not About Fixing You
            </h3>
            <p className="text-muted-foreground text-lg leading-loose max-w-3xl mx-auto mb-6">
              This is not a bootcamp. This is not therapy. This is not about self-improvement or becoming someone else.
            </p>
            <p className="text-muted-foreground text-lg leading-loose max-w-3xl mx-auto mb-6">
              Grounded Warriors exists to create space for men to slow down, drop into the body, and reconnect with what modern life quietly strips away — presence, truth, and grounded strength.
            </p>
            <p className="text-muted-foreground text-lg leading-loose max-w-3xl mx-auto mb-6">
              In a world built on constant acceleration, noise, and pressure, this work offers something different: <span className="text-primary italic">a return.</span>
            </p>
            <p className="font-serif text-xl text-white/90 max-w-2xl mx-auto">
              A return to the body. A return to nature. A return to what is real.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Work - Elements */}
      <section className="py-24 bg-card border-y border-white/5">
        <div className="container px-6 mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">The Work</h2>
            <h3 className="font-serif text-3xl md:text-4xl text-white mb-4">Guided by the Elements</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The retreats are simple, ancient, and intentional. Each experience is shaped by the four elements — not as concepts, but as lived teachers.
            </p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12"
          >
            {[
              { icon: Flame, title: "Fire", desc: "Ceremony, truth, and release. Fire is where men burn what no longer serves — old stories, armour, and patterns that keep them disconnected." },
              { icon: Droplets, title: "Water", desc: "Cold immersion and nervous system awakening. Water teaches resilience, breath, and trust in the body under pressure." },
              { icon: Wind, title: "Air", desc: "Breathwork and conscious respiration. Air opens awareness, releases stored tension, and reconnects men to emotion, clarity, and inner space." },
              { icon: Mountain, title: "Earth", desc: "Nature, movement, and stillness. Earth grounds the work — reminding men they belong to something older, steadier, and wiser than the mind." }
            ].map((el, i) => (
              <motion.div 
                key={i} 
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="text-center group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <el.icon className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg md:text-2xl text-white mb-2 md:mb-3">{el.title}</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{el.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.p {...fadeIn} className="text-center text-muted-foreground italic mt-12 max-w-xl mx-auto">
            Brotherhood is not forced here. It emerges naturally when men walk through the elements together.
          </motion.p>
        </div>
      </section>

      {/* Testimonials Carousel with Parallax */}
      <ParallaxSection image={images.fire}>
        <section className="py-32 md:py-48">
          <div className="container px-6 mx-auto">
            <TestimonialsCarousel />
          </div>
        </section>
      </ParallaxSection>

      {/* Video Highlights Section */}
      <section className="py-24 bg-card border-y border-white/5">
        <div className="container px-6 mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Experience</h2>
            <h3 className="font-serif text-4xl md:text-5xl text-white mb-4">See the Work</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Words can only say so much. This is what happens when men gather on the land.
            </p>
          </motion.div>

          <div className="max-w-md mx-auto">
            <motion.div {...fadeIn} className="relative aspect-[9/16] bg-background/50 border border-white/10 overflow-hidden group">
              <iframe
                src="https://player.vimeo.com/video/1152373112?h=&badge=0&autopause=0&player_id=0&app_id=58479"
                title="Grounded Warriors Retreat Highlights"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                data-testid="video-highlight-main"
              />
            </motion.div>
            <p className="text-center text-muted-foreground text-sm mt-4">
              The Grounded Warriors experience
            </p>
          </div>
        </div>
      </section>

      {/* Facilitators Section */}
      <section className="py-24 bg-background">
        <div className="container px-6 mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Your Guides</h2>
            <h3 className="font-serif text-4xl md:text-5xl text-white mb-4">Holding the Container</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-4">
              Grounded Warriors is co-facilitated by men who walk this path themselves.
            </p>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              The role of the guides is not to lead from above, but to hold a grounded, respectful container where men can meet themselves honestly — without pressure, posturing, or performance. Leadership here is quiet, embodied, and present.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {facilitators.map((facilitator, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.2 }}
                className="group relative overflow-hidden bg-card border border-white/5"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={facilitator.image}
                    alt={facilitator.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <h4 className="font-serif text-2xl text-white mb-1">{facilitator.name}</h4>
                  <p className="text-primary text-sm uppercase tracking-widest mb-4">{facilitator.role}</p>
                  <p className="text-muted-foreground leading-relaxed">{facilitator.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown to Next Retreat */}
      <ParallaxSection image={images.water}>
        <section className="py-24">
          <div className="container px-6 mx-auto text-center">
            <motion.div {...fadeIn}>
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Next Retreat</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-white mb-8">Winter Descent — March 2026</h3>
              <Countdown targetDate={nextRetreatDate} />
              <div className="mt-10">
                <Link href="/retreats">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest font-semibold">
                    Reserve Your Spot
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </ParallaxSection>

      {/* Upcoming Retreats Preview */}
      <section className="py-24 bg-background">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Retreats</h2>
              <h3 className="font-serif text-4xl md:text-5xl text-white">Upcoming Gatherings</h3>
              <p className="text-muted-foreground mt-4 max-w-lg">
                Each retreat is intentionally small and held on the land. The work deepens through simplicity, presence, and shared experience.
              </p>
            </div>
            <Link href="/retreats">
              <Button variant="link" className="text-primary hover:text-white p-0 text-lg group">
                View Full Schedule <span className="group-hover:translate-x-1 transition-transform ml-2">→</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
                    style={{ objectPosition: "center 35%" }}
                  />
                </div>
                <div className="p-6 md:p-8">
                  <span className="text-primary text-xs uppercase tracking-widest border border-primary/20 px-3 py-1 rounded-full inline-block mb-4">
                    {retreat.date}
                  </span>
                  <h4 className="font-serif text-2xl md:text-3xl text-white mb-2 group-hover:text-primary transition-colors">{retreat.title}</h4>
                  <p className="text-muted-foreground mb-4">{retreat.location}</p>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full md:w-auto border-white/20 text-white hover:bg-white hover:text-black rounded-none uppercase text-xs tracking-widest">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-24 bg-card border-t border-white/5">
        <div className="container px-6 mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-4 font-semibold">Community</h2>
            <h3 className="font-serif text-3xl md:text-4xl text-white mb-4">Join the Circle</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
              Grounded Warriors is more than a series of retreats. It is a growing community of men committed to living with presence, integrity, and grounded strength.
            </p>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Receive updates on upcoming retreats, reflections from the fire, and community offerings.
            </p>
            <NewsletterSignup />
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
