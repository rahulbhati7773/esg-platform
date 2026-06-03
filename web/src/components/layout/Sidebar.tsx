import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ClipboardCheck,
  FilePlus2,
  GitCompare,
  Globe2,
  LayoutDashboard,
  Table2,
  Target,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth, type AppRole } from "../../context/AuthContext.js";
import { useShell } from "../../context/ShellContext.js";
import { cn } from "../../lib/cn.js";
import {
  backdropTransition,
  drawerTransition,
  springSnappy,
} from "../../lib/motion.js";

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
};

const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  "data-entry": [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/analytics", label: "Analytics", icon: BarChart3, end: true },
    { to: "/entries/new", label: "New entry", icon: FilePlus2, end: true },
    { to: "/entries", label: "My entries", icon: Table2, end: true },
  ],
  auditor: [
    { to: "/dashboard", label: "Dashboard", icon: ClipboardCheck, end: true },
    { to: "/analytics", label: "Analytics", icon: BarChart3, end: true },
    { to: "/targets", label: "Targets", icon: Target, end: true },
    { to: "/entries", label: "All entries", icon: Table2, end: true },
  ],
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/analytics", label: "Analytics", icon: BarChart3, end: true },
    { to: "/targets", label: "Targets", icon: Target, end: true },
    { to: "/benchmarks", label: "Benchmarks", icon: GitCompare, end: true },
    { to: "/social", label: "People & Gov", icon: Users, end: true },
    { to: "/entries", label: "Entries", icon: Table2, end: true },
  ],
};

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const { closeMobile, isMobile } = useShell();
  const { user } = useAuth();
  const role = user?.role ?? "data-entry";
  const navItems = NAV_BY_ROLE[role];

  return (
    <nav className="flex flex-1 flex-col gap-1 px-2">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => {
            if (isMobile) closeMobile();
          }}
          className="relative"
          title={collapsed ? label : undefined}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="sidebarActive"
                  className="absolute inset-0 rounded-xl bg-[var(--sidebar-active)]"
                  transition={springSnappy}
                />
              )}
              <span
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "text-[var(--primary-foreground)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {!collapsed && <span>{label}</span>}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarInner({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();

  const ROLE_BADGE: Record<AppRole, { label: string; color: string }> = {
    "data-entry": { label: "Data Entry", color: "text-[var(--primary)] bg-[var(--primary-soft)]" },
    auditor: { label: "Auditor", color: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10" },
    admin: { label: "Admin", color: "text-violet-700 bg-violet-50 dark:text-violet-400 dark:bg-violet-400/10" },
  };

  const badge = user ? ROLE_BADGE[user.role] : ROLE_BADGE["data-entry"];

  return (
    <>
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-3 py-5",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]">
          <Globe2 className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </div>
        {!collapsed && (
          <span className="truncate text-lg font-bold tracking-tight text-[var(--text)]">
            ESG Meteor
          </span>
        )}
      </div>

      {/* User card */}
      {!collapsed && user && (
        <div className="mx-3 mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]">
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text)]">
                {user.name}
              </p>
              <span
                className={cn(
                  "mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                  badge.color,
                )}
              >
                {badge.label}
              </span>
            </div>
          </div>
        </div>
      )}

      <SidebarNav collapsed={collapsed} />
    </>
  );
}

export function Sidebar() {
  const { mobileOpen, collapsed, isMobile, closeMobile } = useShell();

  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={backdropTransition}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={drawerTransition}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(280px,88vw)] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] shadow-2xl will-change-transform"
            >
              <SidebarInner collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside
      className={cn(
        "sticky top-0 flex min-h-screen shrink-0 flex-col self-start border-r border-[var(--border)] bg-[var(--sidebar)] transition-[width] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-[width]",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      <SidebarInner collapsed={collapsed} />
    </aside>
  );
}
