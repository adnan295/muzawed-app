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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("muzwd_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("muzwd_user", JSON.stringify(user));
  };

  const logout = () => {
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
      const res = await fetch(`/api/users/${user.id}`);
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
      isAuthenticated: !!user 
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
