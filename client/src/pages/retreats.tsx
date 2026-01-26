import { Layout } from "@/components/layout";
import { retreats } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { RegistrationModal } from "@/components/registration-modal";

const retreatSlugs: Record<number, string> = {
  1: "/retreats/winter-descent",
  2: "/retreats/spring-awakening",
};

export default function Retreats() {
  const [selectedRetreat, setSelectedRetreat] = useState<typeof retreats[0] | null>(null);

  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-20">
            <h1 className="font-serif text-4xl md:text-7xl text-white mb-6">Upcoming Retreats</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your descent. Spaces are strictly limited to ensure the integrity of the container.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {retreats.map((retreat) => (
              <motion.div 
                key={retreat.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-white/5 overflow-hidden group"
              >
                <Link href={retreatSlugs[retreat.id]}>
                  <div className="relative h-64 cursor-pointer">
                    <img 
                      src={retreat.image} 
                      alt={retreat.title} 
                      className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ objectPosition: "center 35%" }}
                    />
                    <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 text-sm font-semibold">
                      ${retreat.depositAmount} Deposit
                    </div>
                  </div>
                </Link>
                <div className="p-8">
                  <span className="text-primary text-xs uppercase tracking-widest mb-3 block">{retreat.date}</span>
                  <Link href={retreatSlugs[retreat.id]}>
                    <h3 className="font-serif text-3xl text-white mb-2 hover:text-primary transition-colors cursor-pointer">{retreat.title}</h3>
                  </Link>
                  <p className="text-muted-foreground mb-2">{retreat.location}</p>
                  <p className="text-white/80 text-sm mb-6">
                    Full Price: <span className="text-primary font-semibold">${retreat.fullAmount}</span>
                  </p>
                  
                  <div className="flex gap-3">
                    <Link href={retreatSlugs[retreat.id]} className="flex-1">
                      <Button 
                        variant="outline"
                        className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-none uppercase tracking-widest py-6"
                        data-testid={`button-details-${retreat.id}`}
                      >
                        Learn More
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => setSelectedRetreat(retreat)}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest py-6"
                      data-testid={`button-register-${retreat.id}`}
                    >
                      Reserve
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* First Responders & Veterans Retreat - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <span className="text-primary text-xs uppercase tracking-widest">Coming Soon</span>
              <h2 className="font-serif text-3xl md:text-4xl text-white mt-2">Specialized Retreats</h2>
            </div>
            
            <div className="bg-card border border-primary/30 overflow-hidden relative">
              <div className="absolute top-4 right-4 bg-amber-600/90 text-white px-4 py-1 text-sm font-semibold z-10">
                Coming April 2026
              </div>
              <div className="md:flex">
                <div className="md:w-1/2 h-64 md:h-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/80 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 mx-auto mb-4 border-2 border-primary/50 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground text-sm uppercase tracking-widest">For Those Who Serve</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8 md:p-10">
                  <span className="text-amber-500 text-xs uppercase tracking-widest mb-3 block">April 3-5, 2026 (Tentative)</span>
                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-3">First Responders & Veterans Retreat</h3>
                  <p className="text-muted-foreground mb-4">Ontario, Canada</p>
                  
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    A specialized healing retreat honoring those who serve. We speak your language—tactical introspection, 
                    emergency protocols for the soul, and brotherhood-led ceremonies. This isn't therapy. 
                    It's the most elite operation of your life: reclaiming your peace.
                  </p>
                  
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Veteran & first responder facilitators</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Off-grid immersion & fire ceremonies</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Legacy-building with your cohort</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link href="/contact" className="flex-1">
                      <Button 
                        variant="outline"
                        className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white rounded-none uppercase tracking-widest py-6"
                        data-testid="button-interest-veterans"
                      >
                        Express Interest
                      </Button>
                    </Link>
                  </div>
                  
                  <p className="text-muted-foreground text-xs mt-4 text-center italic">
                    "Where the most elite operation is the one to reclaim your life."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-center mt-16 border-t border-white/10 pt-16 max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl text-white mb-4">Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Not sure which retreat is right for you? Reach out and we'll help you find the best fit.
            </p>
            <Link href="/contact">
              <Button 
                variant="outline" 
                className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-widest"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {selectedRetreat && (
        <RegistrationModal
          isOpen={!!selectedRetreat}
          onClose={() => setSelectedRetreat(null)}
          retreatTitle={selectedRetreat.title}
          depositAmount={selectedRetreat.depositAmount}
          fullAmount={selectedRetreat.fullAmount}
        />
      )}
    </Layout>
  );
}
