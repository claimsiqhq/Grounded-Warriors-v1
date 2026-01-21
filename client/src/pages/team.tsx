import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { springRetreatHosts } from "@/lib/data";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function Team() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-b from-card to-background">
          <div className="container px-6 mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">Our Guides</span>
              <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                The Team
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Men who have walked the path. Guides who create space for transformation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Team Grid */}
        <section className="py-20">
          <div className="container px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {springRetreatHosts.map((member, index) => (
                <motion.div
                  key={member.name}
                  {...fadeIn}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  className="bg-card border border-white/5 rounded-lg overflow-hidden"
                  data-testid={`card-team-member-${index}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="font-serif text-2xl text-white mb-2">{member.name}</h3>
                    <p className="text-primary text-sm uppercase tracking-widest mb-4">{member.role}</p>
                    <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-20 bg-card border-y border-white/5">
          <div className="container px-6 mx-auto text-center max-w-3xl">
            <motion.div {...fadeIn}>
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">Our Approach</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We believe that healing happens in community. Each of us has walked through our own fires, 
                faced our shadows, and emerged with a deeper understanding of what it means to be a grounded man.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Together, we create a container of safety, challenge, and brotherhood—guiding men back 
                to themselves through the timeless wisdom of nature, cold, fire, and breath.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
