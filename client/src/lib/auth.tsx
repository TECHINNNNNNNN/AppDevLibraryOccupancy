import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { User, LoginData } from "@shared/schema";
import * as msal from '@azure/msal-browser';

// Microsoft Auth configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

// Initialize MSAL instance
let msalInstance: msal.PublicClientApplication | null = null;

// Initialize MSAL on the client side only
if (typeof window !== 'undefined') {
  msalInstance = new msal.PublicClientApplication(msalConfig);
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithMicrosoft: () => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithMicrosoft: async () => {
    throw new Error("AuthContext not initialized");
  },
  logout: async () => {
    throw new Error("AuthContext not initialized");
  },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch the current user on mount
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          sessionStorage.setItem('isLoggedIn', 'true');
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setLoading(false);
      }
    };

    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithMicrosoft = async (): Promise<User> => {
    setLoading(true);
    try {
      if (!msalInstance) {
        throw new Error("Microsoft authentication not initialized");
      }

      // Login request
      const loginRequest = {
        scopes: ['user.read', 'email'],
        prompt: 'select_account'
      };
      
      // Popup login
      const response = await msalInstance.loginPopup(loginRequest);
      
      // Verify email domain is @student.chula.ac.th
      if (!response.account?.username.endsWith('@student.chula.ac.th')) {
        await msalInstance.logout();
        throw new Error('Only Chulalongkorn University accounts are allowed');
      }
      
      // Get token for API calls
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: response.account
      });
      
      // For demo purposes - in real app, we'd send the token to the backend
      // and validate it there
      const user = await apiRequest("POST", "/api/auth/login", {
        microsoftId: response.account.localAccountId,
        email: response.account.username,
        name: response.account.name || 'Unknown User',
        studentId: response.account.username.split('@')[0]
      });
      
      const userData = await user.json();
      setUser(userData.user);
      sessionStorage.setItem('isLoggedIn', 'true');
      return userData.user;
    } catch (error) {
      console.error("Microsoft login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (msalInstance) {
        await msalInstance.logout();
      }
      
      // In a real app, we would call the server to invalidate the session
      // await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      sessionStorage.removeItem('isLoggedIn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithMicrosoft, logout }}>
      {children}
    </AuthContext.Provider>
  );
};