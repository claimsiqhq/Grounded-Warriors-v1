import { Layout } from "@/components/layout";
import { Seo } from "@/components/seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function FAQ() {
  const faqCategories = [
    {
      title: "About the Expeditions",
      faqs: [
        {
          question: "What actually happens on a Grounded Warriors trip?",
          answer: "Three to four days off-grid in the Ontario wild. Depending on the trip you'll be paddling, portaging, hiking, plunging in cold lakes, building fires, sleeping under canvas, cooking communal meals, and gathering at the fire each night. It's physical, it's simple, and it's done with a tight crew of men."
        },
        {
          question: "Do I need previous wilderness experience?",
          answer: "No. You need a base level of fitness and a willingness to push. We handle the route, the gear list, the canoes, and the skills coaching. Plenty of our men have never portaged a canoe or taken a winter plunge before their first trip."
        },
        {
          question: "What if I've never done cold immersion?",
          answer: "You'll be ready. We teach the breathing, the entry, and the warm-up protocol before you ever set foot in the water. It's hard by design, but you're supported every second. The cold is a teacher, and we make sure you meet it prepared."
        },
        {
          question: "Is this a religious trip?",
          answer: "No. We're not affiliated with any religion. We borrow from old wilderness and council-fire traditions, but everyone is welcome at the fire — the work is about you, the land, and the men around you."
        },
        {
          question: "What does a day look like?",
          answer: "Up early. Breathwork or movement. Cold plunge. Hot breakfast around the fire. Then move — paddle, hike, portage, or work on the land — until late afternoon. Dinner together. Council fire after dark. Sleep hard. Repeat."
        },
      ]
    },
    {
      title: "Logistics & Preparation",
      faqs: [
        {
          question: "What's the accommodation like?",
          answer: "Backcountry. Canvas tents, simple cabins, or under the stars depending on the trip. Real beds, warm sleeping bags, dry shelter. No spa. No hot tub. No wifi."
        },
        {
          question: "What should I bring?",
          answer: "We send a detailed packing list after registration. Essentials: warm layers, a good sleeping bag (or borrow one of ours), broken-in boots, swim trunks for the plunge, a knife, a headlamp, and a notebook if you keep one. Leave the phone in the truck — there's no signal anyway."
        },
        {
          question: "Are meals provided?",
          answer: "Yes. All meals are included — simple, hearty, locally sourced food, cooked together over fire or camp stove. We accommodate dietary needs where we can. Let us know during registration."
        },
        {
          question: "Where are the trips held?",
          answer: "Across Ontario — Marmora, Gravenhurst, Muskoka, and Algonquin Park. Each location is picked for its terrain, water, and remoteness. Exact coordinates and meeting points are sent after registration."
        },
        {
          question: "How do I get there?",
          answer: "Most trips are 2–3 hours from Toronto. We send detailed directions and help coordinate carpools. For deeper backcountry trips we set a meeting point at a base camp or trailhead."
        },
      ]
    },
    {
      title: "Safety & Conditioning",
      faqs: [
        {
          question: "Is cold water immersion safe?",
          answer: "When done with proper coaching and warm-up, yes — and we follow strict protocols. Controlled entry, controlled exposure times, immediate re-warming, eyes on every man in the water. Anyone with significant heart conditions or other concerns should clear it with their doctor first."
        },
        {
          question: "What kind of fitness do I need?",
          answer: "Solid baseline cardio and the ability to carry 30–40 lbs over uneven ground for an hour or two. If you can rucksack a few kilometres without stopping, you're ready. Trips have varying intensities — talk to us if you're unsure which is right."
        },
        {
          question: "What if I have physical limitations?",
          answer: "Reach out before you book. We can usually adapt routes and gear for most situations, but some of our trips have hard requirements (long portages, multi-day paddles) where we want to make sure it's the right fit."
        },
        {
          question: "What's the group size?",
          answer: "Small on purpose — usually 8–12 men. Big enough for a real crew, small enough that the guides know every man on the trip and every man knows every other."
        },
      ]
    },
    {
      title: "Registration & Payment",
      faqs: [
        {
          question: "How do I register?",
          answer: "Head to the Retreats page and hit 'Reserve' on the trip you want. Pay the deposit to lock in your spot, and we'll follow up with the prep packet, gear list, and route brief."
        },
        {
          question: "What is the refund policy?",
          answer: "Spots are limited and gear is reserved per man, so deposits are non-refundable. Full payment is due 30 days before the trip. In exceptional circumstances we can offer credit toward a future expedition."
        },
        {
          question: "Can I pay in installments?",
          answer: "Yes. Lock your spot with the deposit and pay the balance before the 30-day cutoff. If you need to spread it out further, just ask."
        },
        {
          question: "What's included in the price?",
          answer: "Lodging, meals, all group gear (canoes, paddles, safety equipment), guides, instruction, and the post-trip integration call. Travel to and from the meeting point is on you."
        },
      ]
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((category) =>
      category.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    ),
  };

  return (
    <Layout>
      <Seo
        title="FAQ | Grounded Warriors"
        description="Everything you need to know before a Grounded Warriors wilderness expedition — logistics, preparation, safety, cold immersion, registration, and payment."
        path="/faq"
        jsonLd={faqJsonLd}
      />
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container px-6 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-6" data-testid="text-faq-heading">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know before you head into the wild.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div 
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h2 className="font-serif text-2xl text-primary mb-6">{category.title}</h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border border-white/10 px-6 data-[state=open]:border-primary/30"
                      data-testid={`accordion-faq-${categoryIndex}-${faqIndex}`}
                    >
                      <AccordionTrigger className="text-white hover:text-primary font-serif text-lg text-left py-5 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-20 pt-16 border-t border-white/10 max-w-2xl mx-auto"
          >
            <h2 className="font-serif text-2xl text-white mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-8">
              We're here to help. Reach out and we'll get back to you personally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest"
                  data-testid="button-contact-us"
                >
                  Contact Us
                </Button>
              </Link>
              <Link href="/retreats">
                <Button 
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-none uppercase tracking-widest"
                  data-testid="button-view-retreats"
                >
                  View Retreats
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
