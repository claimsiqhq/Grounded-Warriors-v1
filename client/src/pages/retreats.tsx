import { Layout } from "@/components/layout";
import { retreats } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "wouter";

export default function Retreats() {
  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-20">
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">Upcoming Retreats</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your descent. Spaces are strictly limited to ensure the integrity of the container.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {retreats.map((retreat) => (
              <div key={retreat.id} className="bg-card border border-white/5 flex flex-col md:flex-row overflow-hidden group">
                <div className="w-full md:w-2/5 relative h-64 md:h-auto">
                  <img src={retreat.image} alt={retreat.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-primary text-xs uppercase tracking-widest border border-primary/20 px-3 py-1 rounded-full">
                        {retreat.date}
                      </span>
                    </div>
                    <h3 className="font-serif text-3xl text-white mb-2">{retreat.title}</h3>
                    <p className="text-muted-foreground mb-6">{retreat.location}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {["All meals included", "4 nights accommodation", "Guided practices"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="block text-2xl text-white font-serif">{retreat.price}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{retreat.spots} Spots Left</span>
                    </div>
                    <Link href="/contact">
                      <Button className="bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest px-8">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
