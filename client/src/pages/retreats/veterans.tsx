import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Heart, Users, Flame, Moon, Mountain, CheckCircle } from "lucide-react";

export default function VeteransRetreat() {
  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        {/* Hero Section */}
        <div className="container px-6 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-amber-500 text-xs uppercase tracking-widest mb-4 block">Coming April 2026</span>
              <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">
                First Responders & Veterans Healing Retreat
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Where the most elite operation is the one to reclaim your life.
              </p>
              <div className="inline-block bg-amber-600/20 border border-amber-500/30 px-6 py-3 rounded">
                <span className="text-amber-400 font-semibold">Tentative Date: April 3-5, 2026</span>
                <span className="text-muted-foreground mx-3">|</span>
                <span className="text-white">Ontario, Canada</span>
              </div>
            </motion.div>
          </div>

          {/* The Crisis Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-20"
          >
            <div className="bg-red-950/20 border border-red-500/20 p-8 md:p-12">
              <h2 className="font-serif text-2xl md:text-3xl text-white mb-6">The Crisis</h2>
              <div className="space-y-4 text-white/80">
                <p className="text-lg">
                  <span className="text-red-400 font-semibold">22 veterans die by suicide every day.</span> Police officers 
                  are 30% more likely to die by suicide than in the line of duty. EMS personnel have the highest rates of 
                  PTSD among all first responders—<span className="text-red-400 font-semibold">nearly 1 in 3.</span>
                </p>
                <p>
                  While billions are spent on traditional intervention programs, recidivism rates remain high because most 
                  programs fail to address the core issue: <span className="text-white">warriors are trained to override their 
                  humanity, and they need support reintegrating it without losing their identity.</span>
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
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">The Solution</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Grounded Warriors delivers immersive, off-grid healing retreats that honor first responders' and veterans' 
                warrior identity while redirecting their operational discipline inward.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 p-8 md:p-12 text-center">
              <p className="text-xl md:text-2xl text-white font-serif italic">
                "We don't ask them to stop being warriors—we help them run the most elite operation of their lives: 
                <span className="text-primary"> reclaiming their peace.</span>"
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
                    <h4 className="text-white font-semibold mb-1">Tactical Introspection</h4>
                    <p className="text-muted-foreground text-sm">
                      After Action Reviews for marriages, Standard Operating Procedures for emotional regulation, 
                      mission planning for life transitions.
                    </p>
                  </div>
                  <div className="border-l-2 border-primary/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">Emergency Protocols for the Soul</h4>
                    <p className="text-muted-foreground text-sm">
                      Immediate action drills for trauma responses, rage, and numbness—making healing operational.
                    </p>
                  </div>
                  <div className="border-l-2 border-primary/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">What Are You Protecting Now?</h4>
                    <p className="text-muted-foreground text-sm">
                      Shifting from protecting others to protecting their peace, marriages, and recovery.
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
                    <h4 className="text-white font-semibold mb-1">The Gear Down Ceremony</h4>
                    <p className="text-muted-foreground text-sm">
                      Conscious rituals around choosing when to wear their operational armor instead of it wearing them 24/7.
                    </p>
                  </div>
                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">The Vigil</h4>
                    <p className="text-muted-foreground text-sm">
                      Night shifts tending fire, writing to themselves and loved ones—familiar rhythms redirected toward self-witnessing.
                    </p>
                  </div>
                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">Building Legacy</h4>
                    <p className="text-muted-foreground text-sm">
                      Each cohort constructs permanent structures on the land—meditation circles, shelters, memorials—creating lineage between brothers.
                    </p>
                  </div>
                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <h4 className="text-white font-semibold mb-1">Controlled Burn Ritual</h4>
                    <p className="text-muted-foreground text-sm">
                      Planned burns they execute together, witnessing regeneration from ash—visceral metaphor for their own transformation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Program Outcomes */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto mb-20"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white text-center mb-12">Program Outcomes</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Immediate Outcomes */}
              <div className="bg-card border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-serif text-xl text-white">Immediate</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Reduced hypervigilance and improved sleep patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Actionable emotional regulation protocols</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Renewed sense of purpose and brotherhood</span>
                  </li>
                </ul>
              </div>

              {/* Long-term Outcomes */}
              <div className="bg-card border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Mountain className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-serif text-xl text-white">Long-term</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Decreased substance dependency and self-destructive behaviors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Improved family relationships and communication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Sustainable peer support networks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">Return to community as mentors and leaders</span>
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
                <h4 className="text-white font-semibold mb-2">Not Therapy-Based</h4>
                <p className="text-muted-foreground text-sm">We use their operational frameworks, not clinical models</p>
              </div>
              
              <div className="bg-card border border-white/10 p-6 text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-2">Identity-Honoring</h4>
                <p className="text-muted-foreground text-sm">Healing is the mission, vulnerability is tactical</p>
              </div>
              
              <div className="bg-card border border-white/10 p-6 text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mountain className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-2">Land-Based Medicine</h4>
                <p className="text-muted-foreground text-sm">Off-grid immersion, fire ceremonies, nature as healer</p>
              </div>
              
              <div className="bg-card border border-white/10 p-6 text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-2">Brotherhood Across Service</h4>
                <p className="text-muted-foreground text-sm">First responders and veterans healing together</p>
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

          {/* Investment / Pricing */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-20"
          >
            <div className="bg-gradient-to-br from-primary/20 to-amber-500/10 border border-primary/30 p-8 md:p-12 text-center">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Investment</h2>
              <div className="text-5xl md:text-6xl font-serif text-primary mb-2">$3,500</div>
              <p className="text-muted-foreground mb-6">4-day retreat, all-inclusive</p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70 mb-8">
                <span className="bg-white/5 px-4 py-2 rounded">Cohort Size: 12-16</span>
                <span className="bg-white/5 px-4 py-2 rounded">Scholarships Available</span>
                <span className="bg-white/5 px-4 py-2 rounded">Follow-up Support Included</span>
              </div>
              
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Funding supports: Facility operations, facilitator training, participant scholarships, 
                land development, and follow-up integration support.
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
