import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Please share a bit more about why you are reaching out"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit");
      }

      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Received",
        description: "We will be in touch shortly.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    submitMutation.mutate(values);
  }

  const faqs = [
    {
      question: "Do I need previous experience with men's work?",
      answer: "No. You only need a willingness to be honest and show up fully. We guide you through the rest."
    },
    {
      question: "What if I've never done cold immersion?",
      answer: "Perfect. We teach you the breathwork and mindset required. It is a challenge by design, but you will be supported every second."
    },
    {
      question: "Is this a religious retreat?",
      answer: "No. We draw on ancient traditions and archetypal psychology, but we are not affiliated with any religion. All beliefs are welcome."
    },
    {
      question: "What is the accommodation like?",
      answer: "Rustic and grounded. Depending on the location, it may be canvas tents, simple cabins, or sleeping under the stars. We strip away luxury to focus on what matters."
    },
    {
      question: "What is the refund policy?",
      answer: "Due to the intimate nature of these retreats and limited spots, deposits are non-refundable. Full payment is required 30 days prior."
    }
  ];

  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-24 mb-20 md:mb-32">
            <div>
              <h1 className="font-serif text-4xl md:text-7xl text-white mb-6">Begin the Descent</h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                Questions about the retreat? Or ready to apply? 
                Send us a message. We read every single one personally.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-lg font-serif mb-2">Email</h3>
                  <p className="text-muted-foreground">bcoones@gmail.com</p>
                </div>
                <div>
                  <h3 className="text-white text-lg font-serif mb-2">Location</h3>
                  <p className="text-muted-foreground">Retreats held in Gravenhurst, Marmora, Muskoka, and Algonquin, Ontario.</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-white/5 p-8 md:p-12">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-white mb-3">Thank You</h3>
                  <p className="text-muted-foreground mb-6">
                    Your message has been received. We'll be in touch soon.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your full name" 
                              {...field} 
                              className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none" 
                              disabled={submitMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              {...field} 
                              className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none" 
                              disabled={submitMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">Why are you here?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a bit about your journey..." 
                              {...field} 
                              className="bg-background border-white/10 focus:border-primary text-white min-h-[150px] rounded-none resize-none" 
                              disabled={submitMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest py-6"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? "Sending..." : "Send Application"}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto border-t border-white/10 pt-20">
            <h2 className="font-serif text-3xl text-white mb-10 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border border-white/10 px-6 data-[state=open]:border-primary/30"
                  data-testid={`accordion-faq-${index}`}
                >
                  <AccordionTrigger className="text-white hover:text-primary font-serif text-lg text-left py-6 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </Layout>
  );
}
