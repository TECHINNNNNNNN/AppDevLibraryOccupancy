import { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { Loader2 } from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import SocialSeating from "@/pages/social-seating";
import LibraryMap from "@/pages/library-map";
import Preferences from "@/pages/preferences";
import NotFound from "@/pages/not-found";

// Lazy load the login page
const Login = lazy(() => import("@/pages/login"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <Switch>
            <Route path="/auth">
              <Login />
            </Route>
            
            <Route path="/">
              {() => {
                // Check if user is logged in
                const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
                
                if (!isLoggedIn) {
                  return <Redirect to="/auth" />;
                }
                
                return (
                  <AppShell>
                    <Switch>
                      <Route path="/" component={Dashboard} />
                      <Route path="/analytics" component={Analytics} />
                      <Route path="/social-seating" component={SocialSeating} />
                      <Route path="/library-map" component={LibraryMap} />
                      <Route path="/preferences" component={Preferences} />
                      <Route component={NotFound} />
                    </Switch>
                  </AppShell>
                );
              }}
            </Route>
          </Switch>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
