import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";

// Simplified auth context with mock login
interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithEmail: async () => {
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in from session storage
    const storedUser = sessionStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Simplified login function for development
  const loginWithEmail = async (email: string): Promise<User> => {
    setLoading(true);
    try {
      // Verify it's a Chula email
      if (!email.endsWith('@student.chula.ac.th')) {
        throw new Error('Only Chulalongkorn University accounts are allowed');
      }
      
      // Create a mock user
      const mockUser: User = {
        id: '123',
        email: email,
        name: email.split('@')[0],
        studentId: email.split('@')[0],
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store in session storage
      sessionStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    sessionStorage.removeItem('mockUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};