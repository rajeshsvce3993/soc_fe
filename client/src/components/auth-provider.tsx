import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("soc_token");
    const userJson = localStorage.getItem("soc_user");
    if (token) {
      setIsAuthenticated(true);
      if (userJson) {
        try {
          const u = JSON.parse(userJson);
          setUser(u);
        } catch {
          setUser(null);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      if (data && data.token) {
        // persist token and user
        localStorage.setItem("soc_token", data.token);
        const userObj = {
          id: typeof data.id === "number" ? data.id : data.id ? Number(data.id) : undefined,
          name: data.name || data.fullName || null,
          email: data.email || email,
          role: data.role || null,
        };
        localStorage.setItem("soc_user", JSON.stringify(userObj));
        setUser(userObj as any);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("soc_token");
    localStorage.removeItem("soc_user");
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
