import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { lazy, Suspense, useEffect, useRef } from "react";
import {
  ClerkProvider,
  Show,
  SignIn,
  SignUp,
  useClerk,
} from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Seo } from "@/components/seo";
import Home from "@/pages/home";

// Route-level code splitting: only the home page ships in the main bundle.
const NotFound = lazy(() => import("@/pages/not-found"));
const About = lazy(() => import("@/pages/about"));
const Experience = lazy(() => import("@/pages/experience"));
const Retreats = lazy(() => import("@/pages/retreats"));
const RetreatMarmora = lazy(() => import("@/pages/retreat-marmora"));
const CostaRicaVolunteerTrip = lazy(() => import("@/pages/costa-rica-volunteer-trip"));
const VeteransRetreat = lazy(() => import("@/pages/retreats/veterans"));
const EventDinner = lazy(() => import("@/pages/event-dinner"));
const EventPlunge = lazy(() => import("@/pages/event-plunge"));
const Contact = lazy(() => import("@/pages/contact"));
const Coaching = lazy(() => import("@/pages/coaching"));
const PastRetreats = lazy(() => import("@/pages/past-retreats"));
const RegistrationSuccess = lazy(() => import("@/pages/registration-success"));
const FAQ = lazy(() => import("@/pages/faq"));
const Team = lazy(() => import("@/pages/team"));
const MemberDashboard = lazy(() => import("@/pages/member-dashboard"));
const MemberDiscussions = lazy(() => import("@/pages/member-discussions"));
const MemberDiscussionDetail = lazy(() => import("@/pages/member-discussion-detail"));
const MemberResources = lazy(() => import("@/pages/member-resources"));
const MemberRetreat = lazy(() => import("@/pages/member-retreat"));
const MemberAlumni = lazy(() => import("@/pages/member-alumni"));
const MemberActivity = lazy(() => import("@/pages/member-activity"));
const MemberProfile = lazy(() => import("@/pages/member-profile"));
const AdminPage = lazy(() => import("@/pages/admin"));

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#c9b896",
    colorForeground: "#c9b896",
    colorMutedForeground: "#8fa68f",
    colorDanger: "#dc6c62",
    colorBackground: "#1e3328",
    colorInput: "#0f1a14",
    colorInputForeground: "#f5ead7",
    colorNeutral: "#3d5a47",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#1e3328] border border-[#3d5a47] w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-[#f5ead7]",
    headerSubtitle: "text-[#8fa68f]",
    socialButtonsBlockButtonText: "text-[#f5ead7]",
    formFieldLabel: "text-[#c9b896] uppercase tracking-wider text-xs",
    footerActionLink: "text-[#c9b896]",
    footerActionText: "text-[#8fa68f]",
    dividerText: "text-[#8fa68f]",
    identityPreviewEditButton: "text-[#c9b896]",
    formFieldSuccessText: "text-[#8fa68f]",
    alertText: "text-[#f5ead7]",
    logoBox: "py-4",
    logoImage: "h-16 w-16 object-contain",
    socialButtonsBlockButton: "border-[#3d5a47] bg-[#0f1a14] hover:bg-[#3d5a47]",
    formButtonPrimary: "bg-[#c9b896] text-[#0f1a14] hover:bg-[#f5ead7]",
    formFieldInput: "border-[#3d5a47] bg-[#0f1a14] text-[#f5ead7]",
    footerAction: "border-t border-[#3d5a47]",
    dividerLine: "bg-[#3d5a47]",
    alert: "border-[#3d5a47] bg-[#0f1a14]",
    otpCodeFieldInput: "border-[#3d5a47] bg-[#0f1a14] text-[#f5ead7]",
    formFieldRow: "gap-2",
    main: "gap-5",
  },
};

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function RouteFallback() {
  return <div className="min-h-screen bg-background" aria-busy="true" />;
}

// Private routes get a generic title and a noindex directive so crawlers
// don't index the login page, member portal, or admin area.
const PRIVATE_ROUTE_TITLES: Array<[RegExp, string]> = [
  [/^\/(login|sign-in|sign-up)/, "Member Login | Grounded Warriors"],
  [/^\/member/, "Member Portal | Grounded Warriors"],
  [/^\/admin$/, "Admin | Grounded Warriors"],
  [/^\/registration\/success$/, "Registration Complete | Grounded Warriors"],
];

function PrivateRouteSeo() {
  const [location] = useLocation();
  const match = PRIVATE_ROUTE_TITLES.find(([re]) => re.test(location));
  if (!match) return null;
  return <Seo title={match[1]} noindex />;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function HomeRoute() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/member" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/about" component={About} />
        <Route path="/experience" component={Experience} />
        <Route path="/retreats" component={Retreats} />
        <Route path="/retreats/marmora" component={RetreatMarmora} />
        <Route path="/retreats/costa-rica-volunteer-trip" component={CostaRicaVolunteerTrip} />
        <Route path="/events/mens-dinner" component={EventDinner} />
        <Route path="/events/train-breath-plunge" component={EventPlunge} />
        {/* Renamed/retired pages keep working via redirects */}
        <Route path="/retreats/equinox-gathering">
          <Redirect to="/retreats/marmora" />
        </Route>
        <Route path="/retreats/winter-descent">
          <Redirect to="/past-retreats" />
        </Route>
        <Route path="/retreats/spring-awakening">
          <Redirect to="/retreats" />
        </Route>
        <Route path="/retreats/first-responders-veterans" component={VeteransRetreat} />
        <Route path="/past-retreats" component={PastRetreats} />
        <Route path="/faq" component={FAQ} />
        <Route path="/team" component={Team} />
        <Route path="/contact" component={Contact} />
        <Route path="/coaching" component={Coaching} />
        <Route path="/registration/success" component={RegistrationSuccess} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/login">
          <Redirect to="/sign-in" />
        </Route>
        <Route path="/member" component={MemberDashboard} />
        <Route path="/member/discussions" component={MemberDiscussions} />
        <Route path="/member/discussions/:id" component={MemberDiscussionDetail} />
        <Route path="/member/resources" component={MemberResources} />
        <Route path="/member/retreats/:id" component={MemberRetreat} />
        <Route path="/member/alumni" component={MemberAlumni} />
        <Route path="/member/activity" component={MemberActivity} />
        <Route path="/member/profile" component={MemberProfile} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    return addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        previousUserId.current !== undefined &&
        previousUserId.current !== userId
      ) {
        queryClient.clear();
      }
      previousUserId.current = userId;
    });
  }, [addListener, queryClient]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your member portal",
          },
        },
        signUp: {
          start: {
            title: "Join the circle",
            subtitle: "Create your member account",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <PrivateRouteSeo />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
