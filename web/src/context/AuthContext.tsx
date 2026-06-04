import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppRole = "data-entry" | "auditor" | "admin";

export interface AuthUser {
  name: string;
  email: string;
  role: AppRole;
  initials: string;
  title: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (role: AppRole, email: string, password: string) => boolean;
  logout: () => void;
}

const MOCK_CREDENTIALS: Record<
  AppRole,
  { email: string; password: string; user: AuthUser }
> = {
  "data-entry": {
    email: "rahul.sharma@esgmeteor.in",
    password: "entry123",
    user: {
      name: "Rahul Sharma",
      email: "rahul.sharma@esgmeteor.in",
      role: "data-entry",
      initials: "RS",
      title: "Data Entry Specialist",
    },
  },
  auditor: {
    email: "shresht.gupta@esgmeteor.in",
    password: "audit123",
    user: {
      name: "Shresht Gupta",
      email: "shresht.gupta@esgmeteor.in",
      role: "auditor",
      initials: "SG",
      title: "ESG Auditor",
    },
  },
  admin: {
    email: "hitesh.singh@esgmeteor.in",
    password: "admin123",
    user: {
      name: "Hitesh Singh",
      email: "hitesh.singh@esgmeteor.in",
      role: "admin",
      initials: "HS",
      title: "Platform Administrator",
    },
  },
};

export function getMockCredentials(role: AppRole) {
  return {
    email: MOCK_CREDENTIALS[role].email,
    password: MOCK_CREDENTIALS[role].password,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "esg-auth-session";

function loadSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as AuthUser;
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadSession);

  const login = useCallback(
    (role: AppRole, email: string, password: string): boolean => {
      const creds = MOCK_CREDENTIALS[role];
      if (
        email.trim().toLowerCase() === creds.email.toLowerCase() &&
        password === creds.password
      ) {
        setUser(creds.user);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(creds.user));
        return true;
      }
      return false;
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated: user !== null, user, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
