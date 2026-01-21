import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Experience from "@/pages/experience";
import Retreats from "@/pages/retreats";
import RetreatWinter from "@/pages/retreat-winter";
import RetreatSpring from "@/pages/retreat-spring";
import Contact from "@/pages/contact";
import PastRetreats from "@/pages/past-retreats";
import RegistrationSuccess from "@/pages/registration-success";
import FAQ from "@/pages/faq";
import Team from "@/pages/team";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/experience" component={Experience} />
      <Route path="/retreats" component={Retreats} />
      <Route path="/retreats/winter-descent" component={RetreatWinter} />
      <Route path="/retreats/spring-awakening" component={RetreatSpring} />
      <Route path="/past-retreats" component={PastRetreats} />
      <Route path="/faq" component={FAQ} />
      <Route path="/team" component={Team} />
      <Route path="/contact" component={Contact} />
      <Route path="/registration/success" component={RegistrationSuccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
