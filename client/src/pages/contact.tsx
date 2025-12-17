import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Please share a bit more about why you are reaching out"),
});

export default function Contact() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Application Received",
      description: "We will be in touch shortly.",
    });
    form.reset();
  }

  return (
    <Layout>
      <div className="pt-32 pb-20 bg-background min-h-screen flex items-center">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h1 className="font-serif text-5xl md:text-7xl text-white mb-6">Begin the Descent</h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                Questions about the retreat? Or ready to apply? 
                Send us a message. We read every single one personally.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-lg font-serif mb-2">Email</h3>
                  <p className="text-muted-foreground">connect@groundedwarriors.com</p>
                </div>
                <div>
                  <h3 className="text-white text-lg font-serif mb-2">Location</h3>
                  <p className="text-muted-foreground">Retreats held in WA, NY, and CO.</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-white/5 p-8 md:p-12">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary uppercase tracking-widest text-xs">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none" />
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
                          <Input placeholder="your@email.com" {...field} className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none" />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest py-6">
                    Send Application
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
