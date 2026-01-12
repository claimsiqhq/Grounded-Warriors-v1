import { Layout } from "@/components/layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function FAQ() {
  const faqCategories = [
    {
      title: "About the Retreats",
      faqs: [
        {
          question: "What happens at a Grounded Warriors retreat?",
          answer: "Our retreats are immersive 3-4 day experiences in the Ontario wilderness. You'll participate in cold water immersion, fire ceremonies, breathwork sessions, men's circle work, solo time in nature, and shared meals. Everything is designed to help you reconnect with yourself, process difficult emotions, and build genuine connections with other men."
        },
        {
          question: "Do I need previous experience with men's work?",
          answer: "No. You only need a willingness to be honest and show up fully. We guide you through the rest. Many men come to us having never done anything like this before."
        },
        {
          question: "What if I've never done cold immersion?",
          answer: "Perfect. We teach you the breathwork and mindset required. It is a challenge by design, but you will be supported every second. The cold is a powerful teacher, and we make sure you're prepared before you enter the water."
        },
        {
          question: "Is this a religious retreat?",
          answer: "No. We draw on ancient traditions and archetypal psychology, but we are not affiliated with any religion. All beliefs are welcome. Our work is about connecting with yourself and nature, not adopting any particular belief system."
        },
        {
          question: "What is the schedule like?",
          answer: "Days begin early with breathwork or movement. Mornings include cold immersion and circle work. Afternoons offer solo time, nature walks, or skill-building activities. Evenings are centered around fire ceremony, storytelling, and deeper conversation. We prioritize presence over productivity."
        },
      ]
    },
    {
      title: "Logistics & Preparation",
      faqs: [
        {
          question: "What is the accommodation like?",
          answer: "Rustic and grounded. Depending on the location, it may be canvas tents, simple cabins, or sleeping under the stars. We strip away luxury to focus on what matters. Expect basic but comfortable sleeping arrangements with proper bedding provided."
        },
        {
          question: "What should I bring?",
          answer: "We'll send you a detailed packing list after registration. Essentials include warm layers, a good sleeping bag (or we can provide one), comfortable clothes for movement, a journal, and an open mind. Leave your phone habits at home—we encourage digital detox during the retreat."
        },
        {
          question: "Are meals provided?",
          answer: "Yes. All meals are included—simple, nourishing food prepared communally. We accommodate dietary restrictions when possible. Let us know your needs during registration."
        },
        {
          question: "Where are the retreats held?",
          answer: "We hold retreats in various locations across Ontario, including Marmora, Gravenhurst, Muskoka, and Algonquin. Each location is chosen for its natural beauty, privacy, and connection to the land. Specific directions are provided after registration."
        },
        {
          question: "How do I get there?",
          answer: "Most retreats are within 2-3 hours of Toronto. We provide detailed directions and can help coordinate carpools with other participants. Some locations are accessible by public transit to nearby towns, with pickup arranged from there."
        },
      ]
    },
    {
      title: "Safety & Support",
      faqs: [
        {
          question: "Is cold water immersion safe?",
          answer: "When done properly with guidance, yes. We follow strict safety protocols, including proper warm-up, controlled exposure times, and immediate warming after. Our facilitators are trained in cold exposure techniques. Men with certain heart conditions or health concerns should consult their doctor first."
        },
        {
          question: "What if I have physical limitations?",
          answer: "We adapt the experience to meet you where you are. Not every activity is mandatory, and there are always alternatives. The most important thing is your presence and participation in whatever way feels right for you."
        },
        {
          question: "Is there mental health support available?",
          answer: "Our facilitators are trained to hold space for emotional processing. However, we are not therapists, and these retreats are not therapy. If you're currently in crisis or managing acute mental health challenges, please consult with your mental health provider before attending."
        },
        {
          question: "What's the group size?",
          answer: "We keep groups intentionally small—typically 8-12 men per retreat. This ensures everyone receives personal attention and the container remains intimate enough for deep work."
        },
      ]
    },
    {
      title: "Registration & Payment",
      faqs: [
        {
          question: "How do I register?",
          answer: "Visit our Retreats page and click 'Reserve Your Spot' on your chosen retreat. You'll provide your information and pay a deposit to secure your place. We'll follow up with preparation materials and any additional details."
        },
        {
          question: "What is the refund policy?",
          answer: "Due to the intimate nature of these retreats and limited spots, deposits are non-refundable. Full payment is required 30 days prior to the retreat. In exceptional circumstances, we may offer credit toward a future retreat."
        },
        {
          question: "Can I pay in installments?",
          answer: "Yes. You can secure your spot with a deposit and pay the remaining balance before the 30-day cutoff. Contact us if you need to discuss alternative payment arrangements."
        },
        {
          question: "What's included in the price?",
          answer: "The retreat fee covers all accommodations, meals, facilitation, materials, and activities for the duration of the retreat. Transportation to and from the location is not included."
        },
      ]
    },
  ];

  return (
    <Layout>
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
              Everything you need to know before you descend.
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
