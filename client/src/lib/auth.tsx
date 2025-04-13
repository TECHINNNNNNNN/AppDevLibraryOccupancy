import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { User, LoginData } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {
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
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (data: LoginData): Promise<User> => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", data);
      const userData = await res.json();
      setUser(userData.user);
      return userData.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      // In a real app, we would call the server to invalidate the session
      // await apiRequest("POST", "/api/auth/logout");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};