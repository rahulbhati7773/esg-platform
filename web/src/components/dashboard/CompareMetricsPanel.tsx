import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getTargets } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { cn } from "../../lib/cn.js";
import { fadeIn } from "../../lib/motion.js";
import { PanelCard } from "../ui/PanelCard.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { TargetStatusItem } from "../../types.js";

function comparePercent(actual: number, target: number): number | null {
  if (target === 0) {
    return null;
  }
  return Math.round(((actual - target) / target) * 1000) / 10;
}

export function CompareMetricsPanel() {
  const { period, facilityId } = usePlatformFilters();
  const [targets, setTargets] = useState<TargetStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void getTargets(period, facilityId)
      .then((data) => {
        if (!cancelled) {
          setTargets(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load comparisons.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period, facilityId]);

  const items = useMemo(() => {
    return targets.slice(0, 6).map((row) => {
      const pct = comparePercent(row.actual, row.target);
      const overTarget = row.actual > row.target;
      return {
        id: `${row.metric}-${row.facility ?? "all"}`,
        title: row.metric.toUpperCase(),
        subtitle: row.facility ?? "All facilities",
        value: row.actual.toLocaleString(),
        pct,
        positive: row.rag === "green",
        overTarget,
      };
    });
  }, [targets]);

  return (
    <motion.div {...fadeIn} className="h-full">
      <PanelCard className="flex h-full flex-col p-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">Compare</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Actual vs target for key metrics
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <ul className="mt-5 flex flex-1 flex-col gap-3">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-20 w-full rounded-xl" />
              </li>
            ))}

          {!loading && items.length === 0 && (
            <li className="py-8 text-center text-sm text-[var(--text-muted)]">
              No targets to compare.
            </li>
          )}

          {!loading &&
            items.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "rounded-xl border px-4 py-3 transition-colors",
                  item.positive
                    ? "border-green-200/80 bg-[var(--success-soft)] dark:border-green-900/40"
                    : "border-red-200/80 bg-[var(--danger-soft)] dark:border-red-900/40",
                )}
              >
                <p className="text-[10px] font-semibold tracking-wide text-[var(--text-muted)]">
                  {item.title}
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-[var(--text)]">
                  {item.value}
                </p>
                <p className="text-xs text-[var(--text-subtle)]">
                  {item.subtitle}
                </p>
                {item.pct !== null && (
                  <span
                    className={cn(
                      "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      item.positive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
                    )}
                  >
                    {item.overTarget ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {item.pct > 0 ? "+" : ""}
                    {item.pct}% vs target
                  </span>
                )}
              </motion.li>
            ))}
        </ul>
      </PanelCard>
    </motion.div>
  );
}
