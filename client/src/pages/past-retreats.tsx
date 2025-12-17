import { Layout } from "@/components/layout";
import { images } from "@/lib/data";
import { motion } from "framer-motion";

export default function PastRetreats() {
  const pastEvents = [
    {
      id: 1,
      date: "November 2025",
      location: "Marmora, ON",
      images: [
        { src: images.manByFire, alt: "Man by the fire", position: "center 30%" },
        { src: images.coldWaterImmersion, alt: "Cold water immersion", position: "center 20%" },
        { src: images.fireBuildingPrep, alt: "Fire building preparation", position: "center 25%" },
      ],
    },
    {
      id: 2,
      date: "July 2025",
      location: "Gravenhurst, ON",
      images: [
        { src: images.coldPlungeCelebration, alt: "Cold plunge celebration", position: "center 25%" },
        { src: images.groundingOutdoors, alt: "Grounding outdoors", position: "center 60%" },
        { src: images.handsWithMaterials, alt: "Natural materials", position: "center 40%" },
      ],
    }
  ];

  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container px-6 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">Past Retreats</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Echoes of the work. Snapshots of the descent.
            </p>
          </motion.div>

          <div className="space-y-32">
            {pastEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                 <div className="mb-8 border-b border-white/5 pb-8">
                    <h2 className="font-serif text-4xl text-white mb-2">{event.date}</h2>
                    <span className="text-primary text-sm uppercase tracking-widest">{event.location}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[500px]">
                    {event.images.map((img, i) => (
                        <div key={i} className={`relative overflow-hidden group ${i === 0 ? 'md:col-span-2 md:row-span-1' : ''} h-[350px] md:h-full`}>
                            <img 
                                src={img.src} 
                                alt={img.alt}
                                style={{ objectPosition: img.position }}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[30%] hover:grayscale-0"
                            />
                        </div>
                    ))}
                 </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
