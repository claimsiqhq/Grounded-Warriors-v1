import { Layout } from "@/components/layout";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Heart, Users, Flame, Mountain, CheckCircle } from "lucide-react";
import veteransHero from "@/assets/images/veterans-hero.jpg";
import firstResponder1 from "@/assets/images/first-responder-1.jpg";
import firstResponder2 from "@/assets/images/first-responder-2.jpg";
import firstResponder3 from "@/assets/images/first-responder-3.jpg";

export default function VeteransRetreat() {
  return (
    <Layout>
      <Seo
        title="First Responders & Veterans Expedition | Grounded Warriors"
        description="A backcountry expedition built for men who've worn the uniform. Tactical, off-grid, no nonsense — led by veteran and first responder facilitators in Ontario."
        path="/retreats/first-responders-veterans"
      />
      {/* Hero Image Section */}
      <div className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img 
            src={veteransHero} 
            alt="Veterans and first responders in nature" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center px-6"
          >
            <span className="text-amber-500 text-xs uppercase tracking-widest mb-4 block">Coming April 2026</span>
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">
              First Responders & Veterans Expedition
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              The next operation is your own ground. Run it the same way you ran every other one.
            </p>
            <div className="inline-block bg-amber-600/20 border border-amber-500/30 px-6 py-3 rounded backdrop-blur-sm">
              <span className="text-amber-400 font-semibold">Tentative Date: April 3-5, 2026</span>
              <span className="text-white/50 mx-3">|</span>
              <span className="text-white">Ontario, Canada</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="pb-20 bg-background">
        <div className="container px-6 mx-auto">
          {/* First Responder Images Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-4 max-w-4xl mx-auto -mt-16 relative z-10 mb-20"
          >
            <div className="aspect-[4/3] overflow-hidden border-2 border-primary/20">
              <img src={firstResponder1} alt="Firefighter" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[4/3] overflow-hidden border-2 border-primary/20">
              <img src={firstResponder2} alt="Paramedic" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[4/3] overflow-hidden border-2 border-primary/20">
              <img src={firstResponder3} alt="Police officer" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* The Crisis Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-20"
          >
            <div className="bg-red-950/20 border border-red-500/20 p-8 md:p-12">
              <h2 className="font-serif text-2xl md:text-3xl text-white mb-6">The Reality</h2>
              <div className="space-y-4 text-white/80">
                <p className="text-lg">
                  <span className="text-red-400 font-semibold">Over 17 veterans die by suicide every day.</span> Police officers
                  are 2-3x more likely to die by suicide than in the line of duty. EMS personnel have the highest rates of
                  operational stress of any first responder group — <span className="text-red-400 font-semibold">nearly 1 in 3.</span>
                </p>
                <p>
                  Most existing programs miss the mark because they ask warriors to put down what made them effective.
                  <span className="text-white"> We don't. We hand them a paddle, point them at the next portage, and run a real operation in the wild — the same discipline, redirected at their own ground.</span>
                </p>
              </div>
            </div>
          </motion.section>

          {/* The Solution Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">The Operation</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                A backcountry expedition built for men who've worn the uniform.
                Off-grid, tactical, no nonsense. Real terrain, real cold, real fire, and a crew of brothers who've been through it.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 p-8 md:p-12 text-center">
              <p className="text-xl md:text-2xl text-white font-serif italic">
                "We don't ask them to stop being warriors. We give them a real mission in the wild —
                <span className="text-primary"> and trust them to run it.</span>"
              </p>
            </div>
          </motion.section>

          {/* Our Unique Approach */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto mb-20"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white text-center mb-12">Our Unique Approach</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* We Speak Their Language */}
              <div className="bg-card border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl text-white">We Speak Their Language</h3>
                </div>
                <div className="space-y-4">
                  <div className="border-l-2 border-primary/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">Tactical Briefings</h4>
                    <p className="text-muted-foreground text-sm">
                      Mission planning, route briefs, gear checks, and after-action reviews — the same operational rhythm,
                      run on a real wilderness route.
                    </p>
                  </div>
                  <div className="border-l-2 border-primary/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">Cold-Water & Stress Protocols</h4>
                    <p className="text-muted-foreground text-sm">
                      Breathing drills, controlled cold exposure, and load-bearing conditioning. Practical tools you'll keep using.
                    </p>
                  </div>
                  <div className="border-l-2 border-primary/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">What Are You Protecting Now?</h4>
                    <p className="text-muted-foreground text-sm">
                      Shifting from protecting others to protecting your own ground, your family, and the brothers beside you.
                    </p>
                  </div>
                </div>
              </div>

              {/* We Create Lasting Impact */}
              <div className="bg-card border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <Flame className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-serif text-2xl text-white">We Create Lasting Impact</h3>
                </div>
                <div className="space-y-4">
                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">The Gear-Down</h4>
                    <p className="text-muted-foreground text-sm">
                      Choosing when to wear the operational armor and when to set it down — instead of it wearing you 24/7.
                    </p>
                  </div>
                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">The Night Vigil</h4>
                    <p className="text-muted-foreground text-sm">
                      Rotating night watches at the fire — familiar rhythms, redirected toward writing, planning, and brotherhood.
                    </p>
                  </div>
                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">Legacy Builds</h4>
                    <p className="text-muted-foreground text-sm">
                      Each cohort builds something permanent on the land — shelters, fire circles, signposts — that the next crew finds standing.
                    </p>
                  </div>
                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">Controlled Burn</h4>
                    <p className="text-muted-foreground text-sm">
                      A planned burn the cohort executes together — practical land-tending, with everything that fire teaches built right in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* What You Take Home */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto mb-20"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white text-center mb-12">What You Take Home</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Off the Trip */}
              <div className="bg-card border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-serif text-xl text-white">Off the Trip</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Cold-water and breathwork drills you'll keep using</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Sharper sleep, lower baseline noise in the body</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">A renewed sense of mission and brotherhood</span>
                  </li>
                </ul>
              </div>

              {/* Down the Road */}
              <div className="bg-card border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Mountain className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-serif text-xl text-white">Down the Road</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Stronger conditioning and a real wilderness skill set</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Steadier presence at home and at work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">A standing crew of brothers from inside and outside the service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Coming back as a guide for the next cohort</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Why We're Different */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-20"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white text-center mb-12">Why We're Different</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-card border border-white/10 p-6 text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-2">Mission, Not Treatment</h4>
                <p className="text-muted-foreground text-sm">We run it on operational frameworks you already know — not clinical models</p>
              </div>
              
              <div className="bg-card border border-white/10 p-6 text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-2">Identity-Honoring</h4>
                <p className="text-muted-foreground text-sm">You don't stop being a warrior — we just hand you a new mission</p>
              </div>

              <div className="bg-card border border-white/10 p-6 text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mountain className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-2">Backcountry Operation</h4>
                <p className="text-muted-foreground text-sm">Off-grid, real terrain, real conditions, real fire</p>
              </div>

              <div className="bg-card border border-white/10 p-6 text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-2">Brotherhood Across Service</h4>
                <p className="text-muted-foreground text-sm">First responders and veterans on the same crew</p>
              </div>
              
              <div className="bg-card border border-white/10 p-6 text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-2">Brother-Led</h4>
                <p className="text-muted-foreground text-sm">Facilitated by those who've served and walked the path</p>
              </div>
              
              <div className="bg-card border border-white/10 p-6 text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-2">Legacy-Building</h4>
                <p className="text-muted-foreground text-sm">Physical and relational structures that outlast the retreat</p>
              </div>
            </div>
          </motion.section>

          {/* Retreat Details */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-20"
          >
            <div className="bg-gradient-to-br from-primary/20 to-amber-500/10 border border-primary/30 p-8 md:p-12 text-center">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Trip Details</h2>
              <div className="text-3xl md:text-4xl font-serif text-primary mb-2">3 Days, 2 Nights</div>
              <p className="text-muted-foreground mb-6">All-inclusive backcountry expedition</p>

              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70 mb-8">
                <span className="bg-white/5 px-4 py-2 rounded">Cohort Size: 12-16</span>
                <span className="bg-white/5 px-4 py-2 rounded">Scholarships Available</span>
                <span className="bg-white/5 px-4 py-2 rounded">Post-Trip Call Included</span>
              </div>

              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Your registration covers: route logistics, group gear, guide team, all meals on the land,
                cohort scholarships, and the post-trip call.
              </p>
            </div>
          </motion.section>

          {/* The Bottom Line */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-16"
          >
            <div className="text-center border-t border-b border-white/10 py-12">
              <h2 className="font-serif text-2xl md:text-3xl text-white mb-6">The Bottom Line</h2>
              <p className="text-xl md:text-2xl text-white/80 font-serif italic leading-relaxed">
                "We're not running another program. We're giving warriors permission to protect their own peace 
                with the same discipline they once protected others."
              </p>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-serif text-2xl text-white mb-4">Express Your Interest</h2>
            <p className="text-muted-foreground mb-8">
              This retreat is currently in development. Contact us to be notified when registration opens 
              or to learn more about the program.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button 
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-none uppercase tracking-widest px-8 py-6"
                  data-testid="button-express-interest"
                >
                  Express Interest
                </Button>
              </Link>
              <Link href="/retreats">
                <Button 
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-none uppercase tracking-widest px-8 py-6"
                  data-testid="button-back-retreats"
                >
                  Back to Retreats
                </Button>
              </Link>
            </div>
            
            <p className="text-muted-foreground text-sm mt-8">
              Contact: <a href="mailto:john@groundedwarriors.com" className="text-primary hover:underline">john@groundedwarriors.com</a>
            </p>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
}
