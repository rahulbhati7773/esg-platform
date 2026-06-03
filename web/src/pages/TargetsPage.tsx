import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Target, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getTargets } from "../api.js";
import { GlobalControllerPanel } from "../components/layout/GlobalControllerPanel.js";
import { PanelCard } from "../components/ui/PanelCard.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { usePlatformFilters } from "../context/PlatformContext.js";
import { cn } from "../lib/cn.js";
import { staggerContainer, staggerItem } from "../lib/motion.js";
import type { RagStatus, TargetStatusItem } from "../types.js";

const RAG_META: Record<RagStatus, { label: string; color: string; bg: string; bar: string; icon: React.ElementType }> = {
  green: {
    label: "On track",
    color: "text-[var(--success)]",
    bg: "bg-[var(--success-soft)] border-green-200 dark:border-green-800",
    bar: "bg-[var(--success)]",
    icon: CheckCircle2,
  },
  amber: {
    label: "At risk",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-400/10 dark:border-amber-800",
    bar: "bg-amber-500",
    icon: AlertTriangle,
  },
  red: {
    label: "Off track",
    color: "text-[var(--danger)]",
    bg: "bg-[var(--danger-soft)] border-red-200 dark:border-red-900",
    bar: "bg-[var(--danger)]",
    icon: XCircle,
  },
};

function ProgressBar({ actual, target, rag }: { actual: number; target: number; rag: RagStatus }) {
  const pct = Math.min((actual / target) * 100, 130);
  const capped = Math.min(pct, 100);
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
      <motion.div
        className={cn("h-full rounded-full", RAG_META[rag].bar)}
        initial={{ width: 0 }}
        animate={{ width: `${capped}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Target line */}
      <span className="absolute right-0 top-0 h-full w-0.5 bg-[var(--border-strong)]" />
    </div>
  );
}

function TargetRow({ item }: { item: TargetStatusItem }) {
  const meta = RAG_META[item.rag];
  const Icon = meta.icon;
  const pct = item.target > 0 ? ((item.actual / item.target) * 100).toFixed(1) : "—";
  const diff = item.actual - item.target;
  const diffSign = diff > 0 ? "+" : "";

  return (
    <div className={cn("rounded-xl border p-3.5 transition", meta.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.color)} />
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">
              {item.facility ?? "All facilities"}
            </p>
            <span className={cn("text-[10px] font-semibold", meta.color)}>{meta.label}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-[var(--text)]">{item.actual.toLocaleString()}</p>
          <p className="text-[10px] text-[var(--text-muted)]">
            Target: {item.target.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <ProgressBar actual={item.actual} target={item.target} rag={item.rag} />
        <div className="flex items-center justify-between text-[10px] text-[var(--text-subtle)]">
          <span>{pct}% of target</span>
          <span className={cn(diff > 0 ? "text-[var(--danger)]" : "text-[var(--success)]")}>
            {diffSign}{diff.toLocaleString(undefined, { maximumFractionDigits: 1 })} variance
          </span>
        </div>
      </div>
    </div>
  );
}

export function TargetsPage() {
  const { period, facilityId } = usePlatformFilters();
  const [targets, setTargets] = useState<TargetStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTargets(period, facilityId)
      .then((data) => { setTargets(data); setError(null); })
      .catch(() => setError("Could not load target data."))
      .finally(() => setLoading(false));
  }, [period, facilityId]);

  // Group by metric
  const byMetric = targets.reduce<Record<string, TargetStatusItem[]>>((acc, item) => {
    const key = item.metric;
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  const green = targets.filter((t) => t.rag === "green").length;
  const amber = targets.filter((t) => t.rag === "amber").length;
  const red = targets.filter((t) => t.rag === "red").length;
  const total = targets.length;
  const complianceScore = total > 0 ? Math.round((green / total) * 100) : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1100px] space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-400/10">
          <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Targets & Compliance</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Track actual performance against annual ESG targets
          </p>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <GlobalControllerPanel />
      </motion.div>

      {/* Compliance score + RAG summary */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <PanelCard className="col-span-2 flex items-center gap-5 p-5 sm:col-span-1">
          <div
            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--primary) ${complianceScore * 3.6}deg, var(--surface-muted) 0deg)`,
            }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface)]">
              <span className="text-sm font-bold text-[var(--text)]">{complianceScore}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Compliance score</p>
            <p className="text-sm font-semibold text-[var(--text)]">
              {green} of {total} targets met
            </p>
          </div>
        </PanelCard>

        {[
          { rag: "green" as RagStatus, count: green, label: "On track" },
          { rag: "amber" as RagStatus, count: amber, label: "At risk" },
          { rag: "red" as RagStatus, count: red, label: "Off track" },
        ].map(({ rag, count, label }) => {
          const meta = RAG_META[rag];
          return (
            <PanelCard key={rag} className="p-4">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", meta.bar)} />
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
              </div>
              <p className={cn("mt-1 text-3xl font-bold", meta.color)}>{count}</p>
            </PanelCard>
          );
        })}
      </motion.div>

      {error && (
        <motion.p variants={staggerItem} className="text-sm text-[var(--danger)]">{error}</motion.p>
      )}

      {/* Per-metric groups */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((j) => <Skeleton key={j} className="h-24 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(byMetric).length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-16 text-center"
        >
          <Target className="mb-3 h-10 w-10 text-[var(--text-subtle)]" />
          <p className="font-semibold text-[var(--text)]">No target data for this period</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Try selecting a period within 2025.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byMetric).map(([metric, items], idx) => (
            <motion.div
              key={metric}
              variants={staggerItem}
              custom={idx}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-[var(--text)]">{metric}</h2>
                <div className="h-px flex-1 bg-[var(--border)]" />
                <div className="flex gap-1.5">
                  {items.map((it) => (
                    <span
                      key={it.facility}
                      className={cn(
                        "h-2 w-2 rounded-full",
                        RAG_META[it.rag].bar,
                      )}
                      title={`${it.facility}: ${RAG_META[it.rag].label}`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <TargetRow key={`${item.metric}-${item.facility}`} item={item} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
