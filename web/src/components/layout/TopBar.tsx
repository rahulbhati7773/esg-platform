import { AnimatePresence, motion } from "framer-motion";
import { Database, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { useTheme } from "../../context/ThemeContext.js";
import { useShell } from "../../context/ShellContext.js";
import { useApiConnectivity } from "../../hooks/useApiConnectivity.js";
import { cn } from "../../lib/cn.js";

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  "data-entry": { bg: "bg-[var(--primary)]", text: "text-white", label: "Data Entry" },
  auditor: { bg: "bg-amber-500", text: "text-white", label: "Auditor" },
  admin: { bg: "bg-violet-600", text: "text-white", label: "Admin" },
};

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toggleSidebar } = useShell();
  const connectivity = useApiConnectivity();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const online = connectivity === "online";
  const roleStyle = user ? ROLE_COLORS[user.role] : ROLE_COLORS["data-entry"];

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-3 backdrop-blur-md transition-colors duration-300 sm:gap-4 sm:px-5 sm:py-3.5">
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.1 }}
        onClick={toggleSidebar}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition-colors duration-150 hover:text-[var(--text)] active:bg-[var(--surface-elevated)]"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </motion.button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text)] sm:text-base">
          ESG reporting
        </p>
        <p className="hidden truncate text-xs text-[var(--text-muted)] sm:block">
          Dashboard & data capture
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition hover:text-[var(--text)]"
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? (
            <Moon className="h-[18px] w-[18px]" />
          ) : (
            <Sun className="h-[18px] w-[18px]" />
          )}
        </motion.button>

        {/* API status */}
        <span
          className={cn(
            "hidden items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-medium sm:inline-flex",
            online
              ? "border-[var(--border)] text-[var(--text-muted)]"
              : "border-red-300/50 text-red-600 dark:text-red-400",
          )}
          title="API status"
        >
          <Database className="h-3.5 w-3.5" />
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              online ? "bg-[var(--primary)]" : "bg-red-500",
            )}
          />
          {online ? "Live" : "Offline"}
        </span>

        {/* Profile menu */}
        {user && (
          <div className="relative">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--border-strong)] sm:px-3"
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold",
                  roleStyle.bg,
                  roleStyle.text,
                )}
              >
                {user.initials}
              </span>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-[11px] font-semibold leading-tight text-[var(--text)]">
                  {user.name}
                </span>
                <span className="text-[10px] leading-tight text-[var(--text-muted)]">
                  {roleStyle.label}
                </span>
              </div>
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  {/* Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-black/10"
                  >
                    {/* User info */}
                    <div className="border-b border-[var(--border)] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                            roleStyle.bg,
                            roleStyle.text,
                          )}
                        >
                          {user.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--text)]">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-[var(--text-muted)]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "mt-2 inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold",
                          roleStyle.bg,
                          roleStyle.text,
                        )}
                      >
                        {user.title}
                      </span>
                    </div>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-[var(--danger)] transition hover:bg-[var(--danger-soft)]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
