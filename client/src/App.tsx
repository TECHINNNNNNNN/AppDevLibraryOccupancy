import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";

import AppShell from "@/components/layout/app-shell";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import SocialSeating from "@/pages/social-seating";
import LibraryMap from "@/pages/library-map";
import Preferences from "@/pages/preferences";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function App() {
  const [location] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Check if we're on the login page
  const isLoginPage = location === "/login";

  useEffect(() => {
    // For demo purposes, redirect to login if not logged in
    // In a real app, we would use the AuthProvider to check
    if (!isLoggedIn && !isLoginPage) {
      setIsLoggedIn(true); // Auto-login for demo
    }
  }, [isLoggedIn, isLoginPage]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {isLoginPage ? (
          <Login onLogin={() => setIsLoggedIn(true)} />
        ) : (
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
        )}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
