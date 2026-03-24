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

function readLocalUser(): User | null {
  try {
    const saved = localStorage.getItem("muzwd_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readLocalUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        const data = await res.json();

        if (cancelled) return;

        if (data.authenticated && data.user) {
          setUser(data.user);
          localStorage.setItem("muzwd_user", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("muzwd_user");
        }
      } catch {
        // Network error — keep optimistic local user but stop blocking
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkSession();
    return () => { cancelled = true; };
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
    } catch {}
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
      const res = await fetch(`/api/users/${user.id}`, { credentials: 'include' });
      if (res.ok) {
        const freshUser = await res.json();
        setUser(freshUser);
        localStorage.setItem("muzwd_user", JSON.stringify(freshUser));
      }
    } catch {}
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
