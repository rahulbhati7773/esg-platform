import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { useEffect, useState } from "react";
import { getTargets } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { cn } from "../../lib/cn.js";
import { fadeIn } from "../../lib/motion.js";
import { PanelCard } from "../ui/PanelCard.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { RagStatus, TargetStatusItem } from "../../types.js";

function ragClass(status: RagStatus): string {
  switch (status) {
    case "green":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "amber":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "red":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  }
}

export function TargetStatusPanel() {
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
          setError("Could not load target status.");
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

  return (
    <motion.div {...fadeIn}>
      <PanelCard className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
            <Target className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Target vs actual
            </h2>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              RAG status: green on target, amber within 10%, red beyond
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="scroll-themed mt-5 min-w-0 overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2.5 text-left">Metric</th>
                <th className="px-3 py-2.5 text-left">Facility</th>
                <th className="px-3 py-2.5 text-right">Actual</th>
                <th className="px-3 py-2.5 text-right">Target</th>
                <th className="px-3 py-2.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-3 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}

              {!loading && targets.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-[var(--text-muted)]"
                  >
                    No targets configured for this period.
                  </td>
                </tr>
              )}

              {!loading &&
                targets.map((row) => (
                  <tr
                    key={`${row.metric}-${row.facility ?? "all"}`}
                    className="border-t border-[var(--border)] hover:bg-[var(--surface-muted)]"
                  >
                    <td className="max-w-[12rem] px-3 py-2.5 font-medium text-[var(--text)]">
                      <span className="block break-words">{row.metric}</span>
                    </td>
                    <td className="max-w-[10rem] px-3 py-2.5 text-[var(--text-muted)]">
                      <span className="block break-words">
                        {row.facility ?? "All facilities"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {row.actual.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-[var(--text-muted)]">
                      {row.target.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                          ragClass(row.rag),
                        )}
                      >
                        {row.rag}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </motion.div>
  );
}
