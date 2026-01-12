import { Layout } from "@/components/layout";
import { images } from "@/lib/data";
import { motion } from "framer-motion";

export default function About() {
  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background">
        <div className="container px-6 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-20"
          >
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">The Work</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We believe that modern masculinity is often a performance—a mask worn to survive. 
              Grounded Warriors is about taking off the mask and returning to the root.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-20 md:mb-32">
            <div className="relative aspect-[4/3] md:aspect-[4/5] overflow-hidden">
              <img src={images.water} alt="Cold Water" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="space-y-6 md:space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl text-white">Why Descent?</h2>
              <p className="text-muted-foreground leading-loose">
                Most personal development tells you to "level up," "crush it," or "ascend." 
                But nature teaches us something different. Trees grow stronger by deepening their roots, not just stretching their branches.
                <br /><br />
                We guide men into the descent—into the body, into the emotions, into the dark soil of the psyche where true transformation happens.
                It is in the descent that we find the gold.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-20 md:mb-32">
            <div className="space-y-6 md:space-y-8 order-2 md:order-1">
              <h2 className="font-serif text-3xl md:text-4xl text-white">The Guides</h2>
              <h3 className="text-primary text-lg italic">Walking the Path Together</h3>
              <p className="text-muted-foreground leading-loose">
                Grounded Warriors is facilitated by men who walk this path themselves.
                The guides have lived through grief, loss, transition, and rebuilding — and bring decades of experience in men's work, somatic practices, breath, cold exposure, and time on the land.
              </p>
              <p className="text-muted-foreground leading-loose">
                We are not gurus.<br />
                We are not above the work.<br />
                We are fellow travelers who know how to build a fire in the dark — and how to hold space while others learn to do the same.
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
                This work isn't about fixing what's broken.<br />
                It's about remembering what's been buried.
              </p>
              <p className="text-muted-foreground leading-loose">
                When men return to the body, the land, and honest connection, clarity follows.<br />
                From clarity comes grounded strength.<br />
                From grounded strength comes integrity, presence, and leadership.
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
