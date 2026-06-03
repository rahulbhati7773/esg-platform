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
    email: "sara.chen@esg-demo.com",
    password: "entry123",
    user: {
      name: "Sara Chen",
      email: "sara.chen@esg-demo.com",
      role: "data-entry",
      initials: "SC",
      title: "Data Entry Specialist",
    },
  },
  auditor: {
    email: "james.okonkwo@esg-demo.com",
    password: "audit123",
    user: {
      name: "James Okonkwo",
      email: "james.okonkwo@esg-demo.com",
      role: "auditor",
      initials: "JO",
      title: "ESG Auditor",
    },
  },
  admin: {
    email: "priya.mehta@esg-demo.com",
    password: "admin123",
    user: {
      name: "Priya Mehta",
      email: "priya.mehta@esg-demo.com",
      role: "admin",
      initials: "PM",
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
