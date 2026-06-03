import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import {
  CheckCircle2,
  ClipboardCheck,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getFacilities,
  getMetrics,
  isApiError,
  listEntries,
  updateEntryStatus,
} from "../api.js";
import { PanelCard } from "../components/ui/PanelCard.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { cn } from "../lib/cn.js";
import { staggerContainer, staggerItem } from "../lib/motion.js";
import type { EsgEntry, Facility, Metric } from "../types.js";
import { nextStatus, statusAdvanceLabel } from "../utils/entryStatus.js";

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  submitted: {
    label: "Awaiting approval",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Awaiting lock",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20",
    dot: "bg-blue-500",
  },
};

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
  const meta = STATUS_META[entry.status] ?? STATUS_META["submitted"];
  const next = nextStatus(entry.status);
  const label = next ? statusAdvanceLabel(next) : null;
  const facility = facilityMap.get(entry.facilityId);
  const metric = metricMap.get(entry.metricId);

  return (
    <motion.div variants={staggerItem}>
      <div className="surface-card p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text)]">
                {facility?.name ?? `Facility #${entry.facilityId}`}
              </span>
              {facility?.location && (
                <span className="text-xs text-[var(--text-subtle)]">{facility.location}</span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  meta.color,
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                {meta.label}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {metric?.name ?? `Metric #${entry.metricId}`}
              {metric?.unit && (
                <span className="ml-1 text-[var(--text-subtle)]">· {metric.unit}</span>
              )}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-base font-bold text-[var(--text)]">
              {entry.value.toLocaleString()}
              {metric?.unit && (
                <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">
                  {metric.unit}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-subtle)]">
            {format(new Date(entry.periodStart), "d MMM yyyy")} –{" "}
            {format(new Date(entry.periodEnd), "d MMM yyyy")}
            {entry.enteredBy && (
              <span className="ml-2">· By {entry.enteredBy}</span>
            )}
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
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
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

export function AuditorQueue() {
  const [entries, setEntries] = useState<EsgEntry[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancingId, setAdvancingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const facilityMap = useMemo(
    () => new Map(facilities.map((f) => [f.id, f])),
    [facilities],
  );
  const metricMap = useMemo(
    () => new Map(metrics.map((m) => [m.id, m])),
    [metrics],
  );

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
    const next = nextStatus(entry.status);
    if (!next) return;
    setAdvancingId(id);
    try {
      await updateEntryStatus(id, { status: next });
      refresh();
    } catch (err) {
      const msg = isApiError(err) ? err.response?.data?.error : undefined;
      setError(msg ?? "Could not update entry status.");
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
      className="mx-auto w-full max-w-[900px] space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-400/10">
            <ClipboardCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">Review Queue</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {loading
                ? "Loading…"
                : total === 0
                  ? "All caught up"
                  : `${total} entries awaiting review`}
            </p>
          </div>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={refresh}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition hover:text-[var(--text)]"
          aria-label="Refresh"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </motion.button>
      </motion.div>

      {error && (
        <motion.p variants={staggerItem} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </motion.p>
      )}

      {/* Stat cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Awaiting approval",
            value: loading ? "—" : submitted.length,
            color: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Awaiting lock",
            value: loading ? "—" : approved.length,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Total in queue",
            value: loading ? "—" : total,
            color: "text-[var(--primary)]",
          },
        ].map((stat) => (
          <PanelCard key={stat.label} className="p-4">
            <p className="text-xs font-medium text-[var(--text-muted)]">{stat.label}</p>
            <p className={cn("mt-1 text-3xl font-bold", stat.color)}>{stat.value}</p>
          </PanelCard>
        ))}
      </motion.div>

      {/* Entry lists */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-16 text-center"
        >
          <CheckCircle2 className="mb-3 h-10 w-10 text-[var(--primary)]" />
          <p className="font-semibold text-[var(--text)]">All caught up!</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">No entries pending review.</p>
        </motion.div>
      ) : (
        <>
          {submitted.length > 0 && (
            <motion.div variants={staggerItem} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Awaiting Approval ({submitted.length})
              </h2>
              <AnimatePresence>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {submitted.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      facilityMap={facilityMap}
                      metricMap={metricMap}
                      onAdvance={(id) => void handleAdvance(id)}
                      advancing={advancingId === entry.id}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {approved.length > 0 && (
            <motion.div variants={staggerItem} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Awaiting Lock ({approved.length})
              </h2>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {approved.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    facilityMap={facilityMap}
                    metricMap={metricMap}
                    onAdvance={(id) => void handleAdvance(id)}
                    advancing={advancingId === entry.id}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
