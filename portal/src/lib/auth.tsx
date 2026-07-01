import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { api, clearStoredToken, getStoredToken, Organization, storeToken } from "./api";

interface AuthContextValue {
  organization: Organization | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then((result) => {
        setOrganization(result.organization);
      })
      .catch(() => {
        clearStoredToken();
        setOrganization(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      organization,
      loading,
      login: async (email: string, password: string) => {
        const result = await api.login(email, password);
        storeToken(result.token);
        setOrganization(result.organization);
      },
      signup: async (name: string, email: string, password: string) => {
        await api.register(name, email, password);
        const result = await api.login(email, password);
        storeToken(result.token);
        setOrganization(result.organization);
      },
      logout: () => {
        clearStoredToken();
        setOrganization(null);
      },
    }),
    [organization, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
