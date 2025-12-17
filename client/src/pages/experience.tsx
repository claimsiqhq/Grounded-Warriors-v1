import { Layout } from "@/components/layout";
import { images } from "@/lib/data";
import { motion } from "framer-motion";

export default function Experience() {
  const timeline = [
    { time: "06:00", title: "Morning Silence & Cold Plunge", desc: "Awaken the body in the river or lake. No speaking." },
    { time: "08:00", title: "Fire Breakfast", desc: "Cooking over open flame. Communal eating." },
    { time: "10:00", title: "Somatic Grounding", desc: "Breathwork and physical practices to release stored tension." },
    { time: "14:00", title: "Deep Nature Immersion", desc: "Solo time in the forest. Tracking, listening, being." },
    { time: "19:00", title: "Council Fire", desc: "The heart of the retreat. Sharing truth in the circle." },
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

          <div className="max-w-3xl mx-auto relative border-l border-white/10 pl-8 md:pl-16 space-y-16">
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 h-[400px] md:h-[600px] w-full">
        <div className="relative group overflow-hidden">
          <img src={images.hero} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
        </div>
        <div className="relative group overflow-hidden">
          <img src={images.fire} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
        </div>
        <div className="relative group overflow-hidden">
          <img src={images.water} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
        </div>
      </div>
    </Layout>
  );
}
