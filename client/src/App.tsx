import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NetworkPage from "@/pages/network-page";
import EventsPage from "@/pages/events-page";
import ResourcesPage from "@/pages/resources-page";
import MentorshipPage from "@/pages/mentorship-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { ChatProvider } from "./hooks/use-chat";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/network" component={NetworkPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/resources" component={ResourcesPage} />
      <ProtectedRoute path="/mentorship" component={MentorshipPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router />
        <Toaster />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
