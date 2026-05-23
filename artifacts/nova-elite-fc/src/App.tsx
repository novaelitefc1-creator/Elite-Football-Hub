import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Programs from "@/pages/Programs";
import Trials from "@/pages/Trials";
import Teams from "@/pages/Teams";
import TeamDetail from "@/pages/TeamDetail";
import News from "@/pages/News";
import NewsDetail from "@/pages/NewsDetail";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import AdminPlayers from "@/pages/AdminPlayers";
import AdminTrials from "@/pages/AdminTrials";
import AdminNews from "@/pages/AdminNews";
import AdminScouting from "@/pages/AdminScouting";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/programs" component={Programs} />
      <Route path="/trials" component={Trials} />
      <Route path="/teams" component={Teams} />
      <Route path="/teams/:id" component={TeamDetail} />
      <Route path="/news" component={News} />
      <Route path="/news/:id" component={NewsDetail} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/players" component={AdminPlayers} />
      <Route path="/admin/trials" component={AdminTrials} />
      <Route path="/admin/news" component={AdminNews} />
      <Route path="/admin/scouting" component={AdminScouting} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
