import { Switch, Route, Redirect, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Seo } from "@/components/seo";
import Home from "@/pages/home";

// Route-level code splitting: only the home page ships in the main bundle.
const NotFound = lazy(() => import("@/pages/not-found"));
const About = lazy(() => import("@/pages/about"));
const Experience = lazy(() => import("@/pages/experience"));
const Retreats = lazy(() => import("@/pages/retreats"));
const RetreatEquinox = lazy(() => import("@/pages/retreat-marmora"));
const VeteransRetreat = lazy(() => import("@/pages/retreats/veterans"));
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
const AdminPage = lazy(() => import("@/pages/admin"));
const Login = lazy(() => import("@/pages/login"));

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
  [/^\/login$/, "Member Login | Grounded Warriors"],
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

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/experience" component={Experience} />
        <Route path="/retreats" component={Retreats} />
        <Route path="/retreats/equinox-gathering" component={RetreatEquinox} />
        {/* Past retreats: their landing pages are retired */}
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
        <Route path="/login" component={Login} />
        <Route path="/member" component={MemberDashboard} />
        <Route path="/member/discussions" component={MemberDiscussions} />
        <Route path="/member/discussions/:id" component={MemberDiscussionDetail} />
        <Route path="/member/resources" component={MemberResources} />
        <Route path="/member/retreats/:id" component={MemberRetreat} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ScrollToTop />
        <PrivateRouteSeo />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
