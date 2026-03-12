import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "@/constants/strings";
const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: "user" | "admin";
  createdAt: string;
};

type AppContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAdmin: boolean;
  pendingCount: number;
  refreshPending: () => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRef = useRef<string | null>(null);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet(["@sl_language", "@sl_user", "@sl_token"]).then((values) => {
      const lang = values[0][1] as Language | null;
      const savedUser = values[1][1];
      const savedToken = values[2][1];
      if (lang) setLanguageState(lang);
      if (savedUser && savedToken) {
        const u = JSON.parse(savedUser) as User;
        setUser(u);
        setToken(savedToken);
        userRef.current = u;
        tokenRef.current = savedToken;
      }
    });
  }, []);

  const fetchPending = async () => {
    if (!tokenRef.current || userRef.current?.role !== "admin") return;
    try {
      const res = await fetch(`${BASE_URL}/admin/properties?status=pending&limit=1`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPendingCount(data.total || 0);
    } catch {}
  };

  useEffect(() => {
    if (user?.role === "admin" && token) {
      fetchPending();
      intervalRef.current = setInterval(fetchPending, 30000);
    } else {
      setPendingCount(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user?.role, token]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem("@sl_language", lang);
  };

  const setAuth = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    userRef.current = newUser;
    tokenRef.current = newToken;
    AsyncStorage.multiSet([
      ["@sl_user", JSON.stringify(newUser)],
      ["@sl_token", newToken],
    ]);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    userRef.current = null;
    tokenRef.current = null;
    setPendingCount(0);
    AsyncStorage.multiRemove(["@sl_user", "@sl_token"]);
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      user,
      token,
      setAuth,
      clearAuth,
      isAdmin: user?.role === "admin",
      pendingCount,
      refreshPending: fetchPending,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
