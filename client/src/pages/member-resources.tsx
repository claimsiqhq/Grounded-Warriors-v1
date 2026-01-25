import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Backpack, Snowflake, Flame, Wind, Moon, FileText } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function MemberResources() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <h2 className="font-serif text-2xl text-white mb-4">Members Only</h2>
              <p className="text-muted-foreground mb-6">Please log in to access member resources.</p>
              <Button asChild className="bg-primary">
                <a href="/api/login" data-testid="button-login">Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const resources = [
    {
      icon: Backpack,
      title: "Packing List",
      description: "Essential items to bring for your retreat experience",
      items: [
        "Warm, layered clothing (wool or synthetic base layers)",
        "Waterproof outer layer and boots",
        "Swimsuit for cold water immersion",
        "Towel (quick-dry recommended)",
        "Personal journal and pen",
        "Headlamp or flashlight",
        "Water bottle (insulated)",
        "Personal medications",
        "Sleeping bag rated for cold temperatures",
        "Comfortable indoor clothes for ceremonies"
      ]
    },
    {
      icon: Snowflake,
      title: "Cold Water Preparation",
      description: "How to prepare your body and mind for cold immersion",
      items: [
        "Start with cold showers 1-2 weeks before the retreat",
        "End each shower with 30-60 seconds of cold water",
        "Practice slow, controlled breathing when exposed to cold",
        "Focus on exhaling fully - this activates your parasympathetic nervous system",
        "Stay hydrated and well-rested before the retreat",
        "Avoid alcohol 48 hours before cold immersion"
      ]
    },
    {
      icon: Wind,
      title: "Breathwork Basics",
      description: "Introduction to the breathing practices we'll explore",
      items: [
        "Practice belly breathing: inhale through nose, expand belly",
        "Try 4-7-8 breathing: inhale 4 counts, hold 7, exhale 8",
        "Box breathing: 4 counts each - inhale, hold, exhale, hold",
        "Morning practice: 5 minutes of conscious breathing upon waking",
        "Avoid heavy meals 2 hours before breathwork sessions"
      ]
    },
    {
      icon: Flame,
      title: "Fire Ceremony",
      description: "Understanding the sacred practice of fire circle",
      items: [
        "Fire ceremonies are spaces for deep listening and presence",
        "What's shared in the circle stays in the circle",
        "Speak from your heart, listen with your heart",
        "No advice-giving or fixing - we hold space for each other",
        "Silence is welcomed and honored"
      ]
    },
    {
      icon: Moon,
      title: "Setting Intentions",
      description: "Preparing your heart and mind for transformation",
      items: [
        "Reflect on what you want to release or let go of",
        "Consider what you want to invite into your life",
        "Write down 3 questions you're sitting with",
        "Think about what support you might need from the group",
        "Arrive with an open heart and willingness to be present"
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="pt-32 pb-12 bg-gradient-to-b from-card to-background">
          <div className="container px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Link href="/member" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-2 block font-semibold">Member Resources</span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight">
                Retreat Preparation
              </h1>
              <p className="text-muted-foreground text-lg mt-4 max-w-2xl">
                Everything you need to know to prepare for your transformative retreat experience.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-12 pb-24">
          <div className="container px-6 mx-auto">
            <div className="grid gap-8 max-w-4xl mx-auto">
              {resources.map((resource, index) => (
                <motion.div 
                  key={resource.title} 
                  {...fadeIn} 
                  transition={{ delay: index * 0.1 }}
                >
                  <Card data-testid={`card-resource-${index}`}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <resource.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{resource.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {resource.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground">
                            <span className="text-primary mt-1.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
