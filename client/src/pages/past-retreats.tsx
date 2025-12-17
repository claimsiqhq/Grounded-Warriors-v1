import { Layout } from "@/components/layout";
import { images } from "@/lib/data";
import { motion } from "framer-motion";

export default function PastRetreats() {
  const pastEvents = [
    {
      id: 1,
      title: "Winter Solstice 2024",
      location: "Olympic Peninsula, WA",
      images: [images.manByFire, images.coldWaterImmersion, images.fireBuildingPrep],
      description: "A deep dive into the darkness of winter. We embraced the cold, sat by the fire, and welcomed the return of the light."
    },
    {
      id: 2,
      title: "River's Edge Spring 2024",
      location: "Catskills, NY",
      images: [images.coldPlungeCelebration, images.groundingOutdoors, images.handsWithMaterials],
      description: "Washing away the old. Cold plunges at dawn, silence in the forest, and the brotherhood of the circle."
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
                 <div className="flex flex-col md:flex-row items-end gap-6 mb-8 border-b border-white/5 pb-8">
                    <div>
                        <span className="text-primary text-xs uppercase tracking-widest block mb-2">{event.location}</span>
                        <h2 className="font-serif text-4xl text-white">{event.title}</h2>
                    </div>
                    <p className="text-muted-foreground md:max-w-lg md:ml-auto text-right md:text-left">{event.description}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[500px]">
                    {event.images.map((img, i) => (
                        <div key={i} className={`relative overflow-hidden group ${i === 0 ? 'md:col-span-2 md:row-span-1' : ''} h-[300px] md:h-full`}>
                            <img 
                                src={img} 
                                alt={`${event.title} photo ${i + 1}`} 
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
