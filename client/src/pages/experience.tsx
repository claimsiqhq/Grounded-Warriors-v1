import { Layout } from "@/components/layout";
import { images } from "@/lib/data";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Experience() {
  const timeline = [
    { time: "06:00", title: "Morning Silence & Cold Plunge", desc: "Awaken the body in the river or lake. No speaking." },
    { time: "08:00", title: "Fire Breakfast", desc: "Cooking over open flame. Communal eating." },
    { time: "10:00", title: "Somatic Grounding", desc: "Breathwork and physical practices to release stored tension." },
    { time: "14:00", title: "Deep Nature Immersion", desc: "Solo time in the forest. Tracking, listening, being." },
    { time: "19:00", title: "Council Fire", desc: "The heart of the retreat. Sharing truth in the circle." },
  ];

  const galleryImages = [
    { src: images.hero, alt: "Forest Landscape" },
    { src: images.fire, alt: "Fire Ceremony" },
    { src: images.water, alt: "Cold Water Immersion" },
    { src: images.hero, alt: "Morning Mist" }, // Reusing for demo, ideally unique
    { src: images.fire, alt: "Evening Gathering" }, // Reusing for demo
  ];

  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background">
        <div className="container px-6 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">The Experience</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A typical day in the wild. No phones. No clocks. Just the rhythm of the earth and the fire.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto relative border-l border-white/10 pl-8 md:pl-16 space-y-16 mb-32">
            {timeline.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <span className="absolute -left-[41px] md:-left-[73px] top-2 w-4 h-4 bg-background border-2 border-primary rounded-full" />
                <span className="text-primary text-sm font-mono uppercase tracking-widest mb-2 block">{item.time}</span>
                <h3 className="font-serif text-3xl text-white mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-12"
          >
             <h2 className="font-serif text-3xl md:text-4xl text-white text-center mb-12">Moments in the Wild</h2>
             
             <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {galleryImages.map((img, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-4">
                    <div className="p-1">
                      <div className="overflow-hidden aspect-[3/4] border border-white/5 bg-card">
                         <img 
                          src={img.src} 
                          alt={img.alt} 
                          className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700" 
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-background/50 border-white/10 hover:bg-primary hover:text-background" />
              <CarouselNext className="bg-background/50 border-white/10 hover:bg-primary hover:text-background" />
            </Carousel>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
