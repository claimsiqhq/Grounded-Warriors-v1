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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img src={images.water} alt="Cold Water" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="space-y-8">
              <h2 className="font-serif text-4xl text-white">Why Descent?</h2>
              <p className="text-muted-foreground leading-loose">
                Most personal development tells you to "level up," "crush it," or "ascend." 
                But nature teaches us something different. Trees grow stronger by deepening their roots, not just stretching their branches.
                <br /><br />
                We guide men into the descent—into the body, into the emotions, into the dark soil of the psyche where true transformation happens.
                It is in the descent that we find the gold.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-row-reverse">
            <div className="space-y-8 order-2 md:order-1">
              <h2 className="font-serif text-4xl text-white">The Facilitator</h2>
              <p className="text-muted-foreground leading-loose">
                Led by seasoned guides who have walked their own paths of grief, loss, and recovery. 
                Our team brings decades of experience in somatics, wilderness survival, and men's work.
                <br /><br />
                We are not gurus. We are fellow travelers who have learned how to build a fire in the dark.
              </p>
            </div>
             <div className="relative aspect-[4/5] overflow-hidden order-1 md:order-2">
              <img src={images.fire} alt="Fire" className="w-full h-full object-cover opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
