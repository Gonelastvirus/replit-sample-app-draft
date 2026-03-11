import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "@/constants/strings";

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
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet(["@sl_language", "@sl_user", "@sl_token"]).then((values) => {
      const lang = values[0][1] as Language | null;
      const savedUser = values[1][1];
      const savedToken = values[2][1];
      if (lang) setLanguageState(lang);
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem("@sl_language", lang);
  };

  const setAuth = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    AsyncStorage.multiSet([
      ["@sl_user", JSON.stringify(newUser)],
      ["@sl_token", newToken],
    ]);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
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
