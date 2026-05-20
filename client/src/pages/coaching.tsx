import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Users, MessageSquare, Flame, Target, ArrowRight } from "lucide-react";
import { images } from "@/lib/data";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  preferredCoach: z.enum(["john", "brian", "no_preference"], {
    errorMap: () => ({ message: "Pick a preferred coach" }),
  }),
  workingOn: z.string().min(10, "Tell us a bit more about what you're working on"),
  ninetyDayWin: z.string().min(10, "Tell us what a 90-day win looks like"),
  scheduleNotes: z.string().optional(),
  budgetComfort: z.string().optional(),
  referralSource: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree before submitting" }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const coaches = [
  {
    key: "john",
    name: "John Shoust",
    title: "Co-Founder + Coach",
    bio:
      "Builder, father, and outdoorsman. Works with men ready to get sharper about their direction — career, family, and the way they carry themselves in both.",
  },
  {
    key: "brian",
    name: "Brian Coones",
    title: "Co-Founder + Coach",
    bio:
      "Wilderness guide and entrepreneur. Pushes hard on follow-through — the practical mechanics of doing the work week after week without flinching.",
  },
];

export default function Coaching() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredCoach: "no_preference",
      workingOn: "",
      ninetyDayWin: "",
      scheduleNotes: "",
      budgetComfort: "",
      referralSource: "",
      consent: false as unknown as true,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { consent: _consent, ...payload } = values;
      const res = await fetch("/api/coaching/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed to submit (HTTP ${res.status})`);
      }
      return res.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Received",
        description: "A coach will reach out within 2 business days.",
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

  const scrollToForm = () => {
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative pt-40 pb-24 md:pt-48 md:pb-32 bg-background overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15,24,18,0.85), rgba(15,24,18,0.95)), url(${images.hiking})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container px-6 mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-primary text-sm uppercase tracking-[0.3em] mb-6 block font-semibold">
              Brown Courage Coaching
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
              1-on-1 Coaching for Men Who Want to Move.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              The off-trail companion to our expeditions. Direct, no-nonsense
              work with a coach — by phone, video, and the occasional walk.
              Built for the man who is done circling.
            </p>
            <Button
              onClick={scrollToForm}
              className="bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest py-6 px-10"
              data-testid="button-scroll-apply"
            >
              Apply Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* What It Is */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-6 mx-auto">
          <div className="max-w-3xl mb-16">
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">What It Is</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Brown Courage Coaching is a private, ongoing 1-on-1 container.
              Same crew, same philosophy as the expeditions — applied to the
              specific terrain of your life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Compass,
                title: "Direction",
                body: "Sort out what you actually want — in work, in your home, in your body — and what's pulling you off line.",
              },
              {
                icon: Target,
                title: "Execution",
                body: "Weekly check-ins, clear commitments, and someone who will call your bluff when you start drifting.",
              },
              {
                icon: Flame,
                title: "Edge",
                body: "Pressure tested challenges between sessions. Cold, hard reps, and the kind of follow-through that compounds.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="bg-card border border-white/5 p-8 hover:border-primary/30 transition-colors"
                data-testid={`card-pillar-${c.title.toLowerCase()}`}
              >
                <c.icon className="w-8 h-8 text-primary mb-6" />
                <h3 className="font-serif text-2xl text-white mb-3">{c.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 md:py-28 bg-card border-y border-white/5">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">
                Who It's For
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
                If any of this lands, we should talk.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We work with capable men who have a hunch they're capable of
                more — and want a coach who will hold the line with them.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "You've been telling yourself the same story for too long.",
                "Work is fine, but the throttle is stuck at 70%.",
                "You want a fitter body, sharper mind, and a clearer week.",
                "You're done with self-help that never asks anything of you.",
                "You want someone in your corner who has actually done the work.",
              ].map((line, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-foreground"
                  data-testid={`text-for-${i}`}
                >
                  <span className="text-primary font-serif">—</span>
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Meet the Coaches */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-6 mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">
              Meet the Coaches
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">Two Coaches. One Standard.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              You'll work with John or Brian. Pick a preference on your
              application — or let us match you on the intro call.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {coaches.map((c) => (
              <div
                key={c.key}
                className="bg-card border border-white/5 p-8"
                data-testid={`card-coach-${c.key}`}
              >
                <div className="w-full aspect-square bg-background border border-white/10 mb-6 flex items-center justify-center">
                  <Users className="w-16 h-16 text-primary/30" />
                </div>
                <h3 className="font-serif text-2xl text-white mb-1">{c.name}</h3>
                <p className="text-primary text-sm uppercase tracking-widest mb-4">
                  {c.title}
                </p>
                <p className="text-muted-foreground leading-relaxed">{c.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-card border-y border-white/5">
        <div className="container px-6 mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">
              How It Works
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">Three Steps.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                n: "01",
                title: "Apply",
                body: "Fill out the form below. Takes about 5 minutes. Honest answers only.",
              },
              {
                n: "02",
                title: "Intro Call",
                body: "30 minutes by phone or video. We check fit both ways and talk through investment.",
              },
              {
                n: "03",
                title: "Begin",
                body: "Pick a coach, lock in a cadence, and start. First commitments inside a week.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="border-l-2 border-primary/30 pl-6"
                data-testid={`step-${s.n}`}
              >
                <div className="font-serif text-primary text-3xl mb-3">{s.n}</div>
                <h3 className="font-serif text-2xl text-white mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl border-t border-white/10 pt-8">
            <p className="text-muted-foreground italic leading-relaxed">
              Investment is discussed on the intro call. Coaching is a real
              commitment of time and money — we'd rather walk you through it
              one-to-one than post a price tag.
            </p>
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="py-20 md:py-28 bg-background">
        <div className="container px-6 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12 text-center">
              <span className="text-primary text-sm uppercase tracking-[0.3em] mb-4 block font-semibold">
                Step One
              </span>
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">Apply for Coaching</h2>
              <p className="text-muted-foreground">
                Every application is read by John and Brian personally.
              </p>
            </div>

            <div className="bg-card border border-white/5 p-8 md:p-12">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl text-white mb-3">Application Received</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    A coach will reach out within 2 business days to book your intro call. Check your inbox (and spam) for a confirmation.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                    data-testid="button-submit-another"
                  >
                    Submit Another
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary uppercase tracking-widest text-xs">
                              Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your full name"
                                {...field}
                                className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none"
                                disabled={submitMutation.isPending}
                                data-testid="input-name"
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
                            <FormLabel className="text-primary uppercase tracking-widest text-xs">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="you@email.com"
                                type="email"
                                {...field}
                                className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none"
                                disabled={submitMutation.isPending}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">
                            Phone (optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(555) 555-5555"
                              {...field}
                              className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none"
                              disabled={submitMutation.isPending}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredCoach"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">
                            Preferred Coach
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2"
                            >
                              {[
                                { v: "john", label: "John Shoust" },
                                { v: "brian", label: "Brian Coones" },
                                { v: "no_preference", label: "No Preference" },
                              ].map((opt) => (
                                <label
                                  key={opt.v}
                                  htmlFor={`coach-${opt.v}`}
                                  className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${
                                    field.value === opt.v
                                      ? "border-primary bg-primary/10"
                                      : "border-white/10 hover:border-white/30"
                                  }`}
                                  data-testid={`radio-coach-${opt.v}`}
                                >
                                  <RadioGroupItem value={opt.v} id={`coach-${opt.v}`} />
                                  <span className="text-white text-sm">{opt.label}</span>
                                </label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workingOn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">
                            What are you working on right now?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Career, body, relationships, business — give us the real story."
                              {...field}
                              className="bg-background border-white/10 focus:border-primary text-white min-h-[120px] rounded-none resize-none"
                              disabled={submitMutation.isPending}
                              data-testid="input-working-on"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ninetyDayWin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">
                            What does a 90-day win look like?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Specific. Measurable if you can. What would make 90 days from now a clear W?"
                              {...field}
                              className="bg-background border-white/10 focus:border-primary text-white min-h-[120px] rounded-none resize-none"
                              disabled={submitMutation.isPending}
                              data-testid="input-ninety-day-win"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduleNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">
                            Schedule notes (optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Time zone, best days, anything we should know about scheduling the intro call."
                              {...field}
                              className="bg-background border-white/10 focus:border-primary text-white min-h-[90px] rounded-none resize-none"
                              disabled={submitMutation.isPending}
                              data-testid="input-schedule-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetComfort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">
                            Budget comfort (optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="A rough range or ceiling — keeps the intro call honest."
                              {...field}
                              className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none"
                              disabled={submitMutation.isPending}
                              data-testid="input-budget-comfort"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referralSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary uppercase tracking-widest text-xs">
                            How did you hear about us? (optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Past expedition, a friend, the newsletter…"
                              {...field}
                              className="bg-background border-white/10 focus:border-primary text-white h-12 rounded-none"
                              disabled={submitMutation.isPending}
                              data-testid="input-referral-source"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-3 space-y-0 pt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value as unknown as boolean}
                              onCheckedChange={(v) => field.onChange(v === true)}
                              disabled={submitMutation.isPending}
                              data-testid="checkbox-consent"
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-snug">
                            <Label className="text-foreground text-sm font-normal">
                              I understand this is a real commitment, and I'm
                              okay with John or Brian following up by email or
                              phone to book the intro call.
                            </Label>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-white hover:text-black rounded-none uppercase tracking-widest py-6"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-application"
                    >
                      {submitMutation.isPending ? "Sending..." : "Submit Application"}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
