import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, ApiUser } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string;
  userName: string;
  userRole: string;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until session check done

  // On mount, restore session from PHP cookie
  useEffect(() => {
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await authApi.login(email, password);
      setUser(user);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<boolean> => {
    try {
      const { user } = await authApi.signup(name, email, password, role);
      setUser(user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await authApi.logout().catch(() => { });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        userEmail: user?.email ?? "",
        userName: user?.name ?? "",
        userRole: user?.role ?? "",
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
