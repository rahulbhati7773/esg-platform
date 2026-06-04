import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  UserPen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMockCredentials, useAuth, type AppRole } from "../context/AuthContext.js";
import { useTheme } from "../context/ThemeContext.js";
import { cn } from "../lib/cn.js";

interface RoleCard {
  role: AppRole;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  softColor: string;
  badge: string;
}

const ROLES: RoleCard[] = [
  {
    role: "data-entry",
    label: "Data Entry",
    description: "Submit & manage ESG records",
    icon: UserPen,
    color: "text-[var(--primary)]",
    softColor: "bg-[var(--primary-soft)]",
    badge: "DE",
  },
  {
    role: "auditor",
    label: "Auditor",
    description: "Review, approve & lock entries",
    icon: ShieldCheck,
    color: "text-amber-600 dark:text-amber-400",
    softColor: "bg-amber-50 dark:bg-amber-400/10",
    badge: "AU",
  },
  {
    role: "admin",
    label: "Administrator",
    description: "Full platform visibility & control",
    icon: Shield,
    color: "text-violet-600 dark:text-violet-400",
    softColor: "bg-violet-50 dark:bg-violet-400/10",
    badge: "AD",
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: EASE },
  }),
};

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<AppRole>("data-entry");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const creds = getMockCredentials(selectedRole);
    setEmail(creds.email);
    setPassword(creds.password);
    setError("");
  }, [selectedRole]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const ok = login(selectedRole, email, password);
    if (ok) {
      navigate("/dashboard", { replace: true });
    } else {
      setError("Incorrect email or password. Use the pre-filled credentials.");
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-10 transition-colors duration-300">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[var(--primary)] opacity-[0.06] blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-[-80px] h-[380px] w-[380px] rounded-full bg-violet-500 opacity-[0.05] blur-[90px]"
      />

      {/* Theme toggle */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.93 }}
        onClick={toggleTheme}
        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-sm transition hover:text-[var(--text)]"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </motion.button>

      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-8 flex flex-col items-center gap-3"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-lg shadow-[var(--primary)]/30">
            <Globe2 className="h-7 w-7 text-white" strokeWidth={2.2} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
              ESG Meteor
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Sustainability reporting platform
            </p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]"
        >
          <p className="mb-1 text-base font-semibold text-[var(--text)]">
            Sign in to your workspace
          </p>
          <p className="mb-5 text-xs text-[var(--text-muted)]">
            Select your role — credentials auto-fill for the demo
          </p>

          {/* Role selector */}
          <div className="mb-5 grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
            {ROLES.map((r, i) => {
              const Icon = r.icon;
              const active = selectedRole === r.role;
              return (
                <motion.button
                  key={r.role}
                  type="button"
                  custom={i + 2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedRole(r.role)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200",
                    active
                      ? "border-[var(--primary)] bg-[var(--primary-soft)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      active ? r.softColor : "bg-[var(--surface-elevated)]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors",
                        active ? r.color : "text-[var(--text-muted)]",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "break-words text-[11px] font-semibold leading-tight transition-colors",
                      active ? "text-[var(--text)]" : "text-[var(--text-muted)]",
                    )}
                  >
                    {r.label}
                  </span>
                  <span className="hidden text-[10px] leading-tight text-[var(--text-subtle)] sm:block">
                    {r.description}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="roleCheck"
                      className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)]"
                    >
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                      </svg>
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] py-2.5 pl-9 pr-3 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] py-2.5 pl-9 pr-10 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] transition hover:text-[var(--text-muted)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-2.5 text-xs text-[var(--danger)]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/25 transition hover:bg-[var(--primary-hover)] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Hint */}
        <motion.p
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-5 text-center text-[11px] text-[var(--text-subtle)]"
        >
          Demo environment — credentials auto-fill when you select a role.
        </motion.p>
      </div>
    </div>
  );
}
