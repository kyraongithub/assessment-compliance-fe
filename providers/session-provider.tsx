"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, getAuthUser, clearAuth } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  role: string;
}

interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getAuthUser();

    if (!token || !storedUser) {
      setIsLoading(false);
      return;
    }

    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const signOut = () => {
    clearAuth();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used within SessionProvider");
  return context;
}
