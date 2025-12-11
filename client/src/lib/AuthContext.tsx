import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface User {
  id: number;
  phone: string;
  facilityName: string;
  facilityType?: string;
  commercialRegister?: string;
  taxNumber?: string;
  cityId?: number | null;
  avatarKey?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (data.authenticated && data.user) {
          setUser(data.user);
          localStorage.setItem("muzwd_user", JSON.stringify(data.user));
        } else {
          const saved = localStorage.getItem("muzwd_user");
          if (saved) {
            const localUser = JSON.parse(saved);
            const loginRes = await fetch('/api/auth/session', {
              credentials: 'include'
            });
            const loginData = await loginRes.json();
            if (!loginData.authenticated) {
              localStorage.removeItem("muzwd_user");
            }
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        const saved = localStorage.getItem("muzwd_user");
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("muzwd_user", JSON.stringify(user));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
    localStorage.removeItem("muzwd_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("muzwd_user", JSON.stringify(updatedUser));
    }
  };

  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const freshUser = await res.json();
        setUser(freshUser);
        localStorage.setItem("muzwd_user", JSON.stringify(freshUser));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      updateUser,
      refreshUser,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
