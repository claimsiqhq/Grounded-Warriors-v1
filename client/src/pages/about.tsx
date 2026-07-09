import { Layout } from "@/components/layout";
import { Seo } from "@/components/seo";
import { images } from "@/lib/data";
import { motion } from "framer-motion";

export default function About() {
  return (
    <Layout>
      <Seo
        title="About | Grounded Warriors"
        description="The philosophy behind Grounded Warriors — cold water, fire, and wilderness as the oldest tools for building sharper, stronger men."
        path="/about"
      />
      <div className="pt-32 pb-20 bg-background">
        <div className="container px-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-20"
          >
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">The Work</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Modern life keeps men comfortable, indoors, and online.
              Grounded Warriors takes them out — into the cold, the fire, and the backcountry — to remember what they're built for.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-20 md:mb-32">
            <div className="relative aspect-[4/3] md:aspect-[4/5] overflow-hidden">
              <img src={images.water} alt="Cold lake plunge" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="space-y-6 md:space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl text-white">Why Adventure?</h2>
              <p className="text-muted-foreground leading-loose">
                Most men know how to push hard at work. Fewer know how to push hard in the wild — to read a trail, build a fire in the rain, take the cold without flinching, paddle a loaded canoe across a lake at dusk.
                <br /><br />
                These are old skills, and they change a man fast. Out here, results come from your hands, your lungs, and the man beside you. There's no résumé, no inbox, no signal. Just the next mile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-20 md:mb-32">
            <div className="space-y-6 md:space-y-8 order-2 md:order-1">
              <h2 className="font-serif text-3xl md:text-4xl text-white">The Guides</h2>
              <h3 className="text-primary text-lg italic">Lead From the Front</h3>
              <p className="text-muted-foreground leading-loose">
                Grounded Warriors is led by men who live this stuff year-round —
                wilderness guides, off-grid builders, endurance athletes, cold-water practitioners with thousands of plunges behind them.
              </p>
              <p className="text-muted-foreground leading-loose">
                We're not coaches.<br />
                We're not standing on the bank with a clipboard.<br />
                We're in the same canoe, the same cold water, and the same fire-circle as everyone on the trip — setting the pace and trusting you to keep it.
              </p>
            </div>
             <div className="relative aspect-[4/3] md:aspect-[4/5] overflow-hidden order-1 md:order-2">
              <img src={images.fire} alt="Fire" className="w-full h-full object-cover opacity-80" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-20 md:mb-32"
          >
            <div className="border-l-2 border-primary/30 pl-8 py-4">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">The Intention</h2>
              <p className="text-muted-foreground leading-loose text-lg mb-6">
                You don't need fixing.<br />
                You need a real day in the wild with men who'll match your effort.
              </p>
              <p className="text-muted-foreground leading-loose">
                Push your body. Sleep on the land. Eat what you cooked.<br />
                Come home sharper than you left.<br />
                That's the whole program.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-16 border-t border-white/10"
          >
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">Grounded Warriors</h2>
            <p className="text-primary text-xl md:text-2xl italic tracking-wide">
              Return to the Elements. Return to Yourself.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
