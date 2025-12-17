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
        { src: images.coldPlungeCelebration, alt: "Cold plunge celebration", position: "center 25%" },
        { src: images.groundingOutdoors, alt: "Grounding outdoors", position: "center 60%" },
        { src: images.handsWithMaterials, alt: "Natural materials", position: "center 40%" },
      ],
    },
    {
      id: 2,
      date: "July 2025",
      location: "Gravenhurst, ON",
      images: [
        { src: images.julyGroupDeck, alt: "Group on deck by lake", position: "center 30%" },
        { src: images.julyGroupForest, alt: "Group in forest", position: "center 35%" },
        { src: images.julyColdPlunge, alt: "Cold plunge meditation", position: "center 30%" },
        { src: images.julyLakeSauna, alt: "Lake and sauna", position: "center 40%" },
        { src: images.julyTipi, alt: "Tipi in forest", position: "center 40%" },
        { src: images.julyCommunalMeal, alt: "Communal meal", position: "center 30%" },
      ],
    },
    {
      id: 3,
      date: "May 2025",
      location: "Muskoka, ON",
      images: [
        { src: images.mayCircle, alt: "Circle practice", position: "center 40%" },
        { src: images.mayColdPlunge, alt: "Cold plunge meditation", position: "center 25%" },
        { src: images.mayLogBalance, alt: "Log balance challenge", position: "center 35%" },
        { src: images.mayForestWalk, alt: "Forest walk", position: "center 40%" },
        { src: images.mayMeditation, alt: "Group meditation", position: "center 40%" },
        { src: images.mayConversation, alt: "Deep conversation", position: "center 30%" },
      ],
    },
    {
      id: 4,
      date: "March 2025",
      location: "Marmora, ON",
      images: [
        { src: images.marchIcePlunge, alt: "Ice plunge", position: "center 35%" },
        { src: images.marchSauna, alt: "Sauna", position: "center 50%" },
        { src: images.marchWinterHike, alt: "Winter hike", position: "center 25%" },
        { src: images.marchContemplation, alt: "Contemplation", position: "center 30%" },
        { src: images.marchRest, alt: "Rest and recovery", position: "center 50%" },
        { src: images.marchSnowTraining, alt: "Snow training", position: "center 40%" },
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

                 {event.images.length > 0 ? (
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {event.images.map((img, i) => (
                          <div key={i} className="relative overflow-hidden group aspect-[4/5]">
                              <img 
                                  src={img.src} 
                                  alt={img.alt}
                                  style={{ objectPosition: img.position }}
                                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[30%] hover:grayscale-0"
                              />
                          </div>
                      ))}
                   </div>
                 ) : (
                   <div className="text-center py-16 border border-white/5 bg-card/50">
                     <p className="text-muted-foreground italic">Photos coming soon</p>
                   </div>
                 )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
