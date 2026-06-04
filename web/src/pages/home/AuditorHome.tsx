import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  Table2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getFacilities, getMetrics, isApiError, listEntries, updateEntryStatus } from "../../api.js";
import { PanelCard } from "../../components/ui/PanelCard.js";
import { Skeleton } from "../../components/ui/Skeleton.js";
import { useAuth } from "../../context/AuthContext.js";
import { cn } from "../../lib/cn.js";
import { staggerContainer, staggerItem } from "../../lib/motion.js";
import type { EsgEntry, Facility, Metric } from "../../types.js";
import { nextStatusForRole } from "../../lib/entryPermissions.js";
import { statusAdvanceLabel } from "../../utils/entryStatus.js";

function EntryCard({
  entry,
  facilityMap,
  metricMap,
  onAdvance,
  advancing,
}: {
  entry: EsgEntry;
  facilityMap: Map<number, Facility>;
  metricMap: Map<number, Metric>;
  onAdvance: (id: number) => void;
  advancing: boolean;
}) {
  const next = nextStatusForRole(entry.status, "auditor");
  const label = next ? statusAdvanceLabel(next) : null;
  const facility = facilityMap.get(entry.facilityId);
  const metric = metricMap.get(entry.metricId);

  return (
    <motion.div variants={staggerItem}>
      <div className="surface-card p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--text)]">
              {facility?.name ?? `Facility #${entry.facilityId}`}
              {facility?.location && (
                <span className="ml-1.5 text-xs font-normal text-[var(--text-subtle)]">
                  {facility.location}
                </span>
              )}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {metric?.name ?? `Metric #${entry.metricId}`}
              {metric?.unit && <span className="ml-1 text-[var(--text-subtle)]">· {metric.unit}</span>}
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold text-[var(--text)]">
            {entry.value.toLocaleString()}
            {metric?.unit && (
              <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">{metric.unit}</span>
            )}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-[var(--text-subtle)]">
            {format(new Date(entry.periodStart), "d MMM yyyy")} –{" "}
            {format(new Date(entry.periodEnd), "d MMM yyyy")}
          </p>
          {next && label && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={advancing}
              onClick={() => onAdvance(entry.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                entry.status === "submitted"
                  ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                  : "bg-violet-600 text-white hover:bg-violet-700",
                advancing && "opacity-60",
              )}
            >
              {advancing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : entry.status === "submitted" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              {label}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AuditorHome() {
  const { user } = useAuth();
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  const [entries, setEntries] = useState<EsgEntry[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancingId, setAdvancingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const facilityMap = useMemo(() => new Map(facilities.map((f) => [f.id, f])), [facilities]);
  const metricMap = useMemo(() => new Map(metrics.map((m) => [m.id, m])), [metrics]);

  const submitted = entries.filter((e) => e.status === "submitted");
  const approved = entries.filter((e) => e.status === "approved");

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listEntries({ status: "submitted" }),
      listEntries({ status: "approved" }),
      getFacilities(),
      getMetrics(),
    ])
      .then(([s, a, f, m]) => {
        setEntries([...s, ...a]);
        setFacilities(f);
        setMetrics(m);
        setError(null);
      })
      .catch(() => setError("Could not load entries."))
      .finally(() => setLoading(false));
  }, [refreshToken]);

  async function handleAdvance(id: number) {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const next = nextStatusForRole(entry.status, "auditor");
    if (!next) return;
    setAdvancingId(id);
    try {
      await updateEntryStatus(id, { status: next });
      refresh();
    } catch (err) {
      const msg = isApiError(err) ? err.response?.data?.error : undefined;
      setError(msg ?? "Could not update entry.");
    } finally {
      setAdvancingId(null);
    }
  }

  const total = submitted.length + approved.length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1000px] space-y-6"
    >
      {/* Welcome */}
      <motion.div variants={staggerItem} className="surface-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[var(--text-subtle)]">{today}</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
              Welcome, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {loading ? "Loading queue…" : total === 0 ? "Your review queue is clear." : `${total} entries need your attention`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 items-center rounded-lg bg-amber-100 px-3 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
              Auditor
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={refresh}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Queue stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <PanelCard className="p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <p className="text-xs font-medium text-[var(--text-muted)]">Awaiting approval</p>
          </div>
          {loading ? <Skeleton className="mt-1 h-8 w-12" /> : (
            <p className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">{submitted.length}</p>
          )}
        </PanelCard>
        <PanelCard className="p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-xs font-medium text-[var(--text-muted)]">Awaiting lock</p>
          </div>
          {loading ? <Skeleton className="mt-1 h-8 w-12" /> : (
            <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">{approved.length}</p>
          )}
        </PanelCard>
        <Link
          to="/entries"
          className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--border-strong)] hover:shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4 text-[var(--text-muted)]" />
            <p className="text-xs font-medium text-[var(--text-muted)]">All entries</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--text)]">View all records</p>
            <ArrowRight className="h-4 w-4 text-[var(--text-subtle)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
          </div>
        </Link>
      </motion.div>

      {error && (
        <motion.p variants={staggerItem} className="text-sm text-red-600 dark:text-red-400">{error}</motion.p>
      )}

      {/* Priority: submitted entries first */}
      {loading ? (
        <motion.div variants={staggerItem} className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </motion.div>
      ) : total === 0 ? (
        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-12 text-center"
        >
          <CheckCircle2 className="mb-3 h-10 w-10 text-[var(--primary)]" />
          <p className="font-semibold text-[var(--text)]">All caught up!</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">No entries pending review.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Submitted col */}
          <motion.div variants={staggerItem} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Needs Approval ({submitted.length})
              </h2>
            </div>
            <AnimatePresence>
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
                {submitted.slice(0, 5).map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    facilityMap={facilityMap}
                    metricMap={metricMap}
                    onAdvance={(id) => void handleAdvance(id)}
                    advancing={advancingId === entry.id}
                  />
                ))}
                {submitted.length > 5 && (
                  <Link to="/entries" className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                    +{submitted.length - 5} more → View all
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Approved col */}
          <motion.div variants={staggerItem} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Needs Lock ({approved.length})
              </h2>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
              {approved.slice(0, 5).map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  facilityMap={facilityMap}
                  metricMap={metricMap}
                  onAdvance={(id) => void handleAdvance(id)}
                  advancing={advancingId === entry.id}
                />
              ))}
              {approved.length > 5 && (
                <Link to="/entries" className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                  +{approved.length - 5} more → View all
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
