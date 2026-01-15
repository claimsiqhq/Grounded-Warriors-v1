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
