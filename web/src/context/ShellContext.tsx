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
  /** Right-side glossary panel (macOS-style) */
  glossaryOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeMobile: () => void;
  openGlossary: () => void;
  closeGlossary: () => void;
  toggleGlossary: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

const MOBILE_QUERY = "(max-width: 767px)";

export function ShellProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
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
    if ((isMobile && mobileOpen) || glossaryOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [isMobile, mobileOpen, glossaryOpen]);

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

  const openGlossary = useCallback(() => {
    setGlossaryOpen(true);
    setMobileOpen(false);
  }, []);

  const closeGlossary = useCallback(() => {
    setGlossaryOpen(false);
  }, []);

  const toggleGlossary = useCallback(() => {
    setGlossaryOpen((open) => {
      if (!open) {
        setMobileOpen(false);
      }
      return !open;
    });
  }, []);

  const value = useMemo(
    () => ({
      mobileOpen,
      collapsed,
      glossaryOpen,
      isMobile,
      toggleSidebar,
      closeMobile,
      openGlossary,
      closeGlossary,
      toggleGlossary,
    }),
    [
      mobileOpen,
      collapsed,
      glossaryOpen,
      isMobile,
      toggleSidebar,
      closeMobile,
      openGlossary,
      closeGlossary,
      toggleGlossary,
    ],
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
