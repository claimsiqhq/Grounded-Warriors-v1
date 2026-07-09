import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { Seo } from "@/components/seo";
import { springRetreatHosts } from "@/lib/data";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function Team() {
  const teamJsonLd = springRetreatHosts.map((member) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    worksFor: { "@type": "Organization", name: "Grounded Warriors" },
  }));

  return (
    <Layout>
      <Seo
        title="The Team | Grounded Warriors"
        description="Meet the Grounded Warriors guides — wilderness guides, builders, and athletes who lead every expedition from the front."
        path="/team"
        jsonLd={teamJsonLd}
      />
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
                Wilderness guides, builders, and athletes who lead every trip from the front.
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
                      loading="lazy"
                      decoding="async"
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
                We lead from the front. Same canoe, same cold water, same packs, same fire as everyone on the trip.
                Between us we've spent decades on the land — guiding, building, paddling, climbing, plunging, and teaching the skills that make a man at home in the wild.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our job is to set the route, hold the standard, and trust you to rise to it.
                The land does the rest.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
