import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ShellContextValue = {
  /** Mobile drawer open */
  mobileOpen: boolean;
  /** Desktop icon-only mode */
  collapsed: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeMobile: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

const MOBILE_QUERY = "(max-width: 767px)";

export function ShellProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_QUERY).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (mobile) {
        setMobileOpen(false);
        setCollapsed(false);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, mobileOpen]);

  const toggleSidebar = useCallback(() => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setMobileOpen((open) => !open);
    } else {
      setCollapsed((c) => !c);
    }
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      mobileOpen,
      collapsed,
      isMobile,
      toggleSidebar,
      closeMobile,
    }),
    [mobileOpen, collapsed, isMobile, toggleSidebar, closeMobile],
  );

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useShell must be used within ShellProvider");
  }
  return ctx;
}
