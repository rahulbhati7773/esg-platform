import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FilePlus2,
  FileText,
  Lock,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getFacilities, getMetrics, listEntries } from "../../api.js";
import { PanelCard } from "../../components/ui/PanelCard.js";
import { Skeleton } from "../../components/ui/Skeleton.js";
import { useAuth } from "../../context/AuthContext.js";
import { cn } from "../../lib/cn.js";
import { staggerContainer, staggerItem } from "../../lib/motion.js";
import type { EsgEntry, Facility, Metric } from "../../types.js";

const STATUS_STYLE: Record<
  string,
  { label: string; icon: React.ElementType; color: string; dot: string }
> = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "text-[var(--text-subtle)] bg-[var(--surface-elevated)]",
    dot: "bg-[var(--text-subtle)]",
  },
  submitted: {
    label: "Submitted",
    icon: Send,
    color: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-[var(--primary)] bg-[var(--primary-soft)]",
    dot: "bg-[var(--primary)]",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    color: "text-violet-700 bg-violet-50 dark:text-violet-400 dark:bg-violet-400/10",
    dot: "bg-violet-500",
  },
};

export function DataEntryHome() {
  const { user } = useAuth();
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  const [entries, setEntries] = useState<EsgEntry[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  const facilityMap = useMemo(() => new Map(facilities.map((f) => [f.id, f])), [facilities]);
  const metricMap = useMemo(() => new Map(metrics.map((m) => [m.id, m])), [metrics]);

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([listEntries({}), getFacilities(), getMetrics()])
      .then(([e, f, m]) => {
        setEntries(e);
        setFacilities(f);
        setMetrics(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const counts = useMemo(
    () => ({
      draft: entries.filter((e) => e.status === "draft").length,
      submitted: entries.filter((e) => e.status === "submitted").length,
      approved: entries.filter((e) => e.status === "approved").length,
      locked: entries.filter((e) => e.status === "locked").length,
    }),
    [entries],
  );

  const recent = entries.slice(0, 8);

  const STATS = [
    { key: "draft", label: "Draft", value: counts.draft, color: "text-[var(--text-muted)]" },
    { key: "submitted", label: "Submitted", value: counts.submitted, color: "text-amber-600 dark:text-amber-400" },
    { key: "approved", label: "Approved", value: counts.approved, color: "text-[var(--primary)]" },
    { key: "locked", label: "Locked", value: counts.locked, color: "text-violet-600 dark:text-violet-400" },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="page-container max-w-[1000px] space-y-6"
    >
      {/* Welcome */}
      <motion.div variants={staggerItem} className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--text-subtle)]">{today}</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
              Good to see you, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Ready to capture today's ESG readings?
            </p>
          </div>
          <span className="inline-flex h-8 items-center self-start rounded-lg bg-[var(--primary-soft)] px-3 text-xs font-semibold text-[var(--primary)] sm:self-center">
            Data Entry Specialist
          </span>
        </div>
      </motion.div>

      {/* Stats + CTA */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        {/* Status counts */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <PanelCard key={s.key} className="p-4">
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              {loading ? (
                <Skeleton className="mt-1 h-8 w-12" />
              ) : (
                <p className={cn("mt-1 text-3xl font-bold", s.color)}>{s.value}</p>
              )}
            </PanelCard>
          ))}
        </div>

        {/* New Entry CTA */}
        <Link
          to="/entries/new"
          className="group flex w-full min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--primary)]/40 bg-[var(--primary-soft)] p-5 text-center transition hover:border-[var(--primary)] hover:shadow-sm sm:min-w-[180px] sm:w-auto"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30 transition group-hover:scale-105">
            <FilePlus2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--primary)]">New Entry</p>
            <p className="text-xs text-[var(--text-muted)]">Add a reading</p>
          </div>
        </Link>
      </motion.div>

      {/* Recent entries */}
      <motion.div variants={staggerItem}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text)]">Recent entries</h2>
          <Link
            to="/entries"
            className="flex items-center gap-1 text-xs text-[var(--primary)] transition hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <PanelCard className="overflow-hidden p-0">
          {loading ? (
            <div className="space-y-0 divide-y divide-[var(--border)]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="ml-auto h-5 w-16" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Clock className="mb-2 h-8 w-8 text-[var(--text-subtle)]" />
              <p className="text-sm text-[var(--text-muted)]">No entries yet.</p>
              <Link to="/entries/new" className="mt-2 text-xs text-[var(--primary)] hover:underline">
                Add your first entry →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recent.map((entry) => {
                const facility = facilityMap.get(entry.facilityId);
                const metric = metricMap.get(entry.metricId);
                const st = STATUS_STYLE[entry.status] ?? STATUS_STYLE.draft;
                return (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 hover:bg-[var(--surface-muted)] sm:flex-nowrap"
                  >
                    <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                      <p className="break-words text-sm font-medium text-[var(--text)]">
                        {facility?.name ?? `Facility #${entry.facilityId}`}
                      </p>
                      <p className="break-words text-xs text-[var(--text-muted)]">
                        {metric?.name ?? `Metric #${entry.metricId}`}
                        {metric?.unit && <span className="ml-1">· {metric.unit}</span>}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {entry.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--text-subtle)]">
                        {format(new Date(entry.periodStart), "MMM yyyy")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        st.color,
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>
      </motion.div>
    </motion.div>
  );
}
