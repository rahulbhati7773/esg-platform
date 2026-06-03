import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Table2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DataQuality } from "../../components/dashboard/DataQuality.js";
import { HeroKpiRow } from "../../components/dashboard/HeroKpiRow.js";
import { PanelCard } from "../../components/ui/PanelCard.js";
import { useAuth } from "../../context/AuthContext.js";
import { staggerContainer, staggerItem } from "../../lib/motion.js";

const QUICK_LINKS = [
  {
    to: "/analytics",
    icon: BarChart3,
    label: "Analytics",
    desc: "Charts, trends & benchmarks",
    color: "text-[var(--primary)] bg-[var(--primary-soft)]",
  },
  {
    to: "/entries",
    icon: Table2,
    label: "All Entries",
    desc: "Browse every ESG record",
    color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-400/10",
  },
  {
    to: "/analytics",
    icon: FileText,
    label: "Target Status",
    desc: "RAG against annual targets",
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10",
  },
];

export function AdminHome() {
  const { user } = useAuth();
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px] space-y-6"
    >
      {/* Welcome header */}
      <motion.div variants={staggerItem} className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--text-subtle)]">{today}</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Here's your platform overview for today
            </p>
          </div>
          <span className="inline-flex h-8 items-center self-start rounded-lg bg-violet-100 px-3 text-xs font-semibold text-violet-700 dark:bg-violet-400/10 dark:text-violet-400 sm:self-center">
            Platform Administrator
          </span>
        </div>
      </motion.div>

      {/* KPI hero */}
      <motion.div variants={staggerItem}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Key Performance Indicators
        </p>
        <HeroKpiRow />
      </motion.div>

      {/* Quick links + Data quality */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] lg:gap-6"
      >
        {/* Quick actions */}
        <PanelCard>
          <h2 className="mb-4 text-sm font-semibold text-[var(--text)]">Quick navigation</h2>
          <div className="space-y-3">
            {QUICK_LINKS.map(({ to, icon: Icon, label, desc, color }) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center gap-3 rounded-xl border border-[var(--border)] p-3.5 transition hover:border-[var(--border-strong)] hover:shadow-sm"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-subtle)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
              </Link>
            ))}
          </div>
        </PanelCard>

        {/* Data quality mini */}
        <div>
          <DataQuality />
        </div>
      </motion.div>
    </motion.div>
  );
}
