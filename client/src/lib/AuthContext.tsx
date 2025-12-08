import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  phone: string;
  facilityName: string;
  facilityType?: string;
  commercialRegister?: string;
  taxNumber?: string;
  cityId?: number | null;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("sary_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("sary_user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sary_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("sary_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      updateUser,
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
