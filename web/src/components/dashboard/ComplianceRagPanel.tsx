import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getTargets } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { PanelCard } from "../ui/PanelCard.js";
import { RagIndicator } from "../ui/RagIndicator.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { TargetStatusItem } from "../../types.js";

export function ComplianceRagPanel() {
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
          setError("Could not load targets for this period.");
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
    <PanelCard>
      <h3 className="text-sm font-semibold text-slate-800">
        Targets vs actual
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Green = on track, amber = within warning band, red = off track.
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 min-w-0 overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3">Facility</th>
              <th className="px-4 py-3 text-right">Actual</th>
              <th className="px-4 py-3 text-right">Target</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {!loading && targets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No targets configured for this period.
                </td>
              </tr>
            )}
            {!loading &&
              targets.map((row, index) => (
                <motion.tr
                  key={`${row.metric}-${row.facility ?? "all"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="max-w-[12rem] px-4 py-3 font-medium text-slate-800">
                    <span className="block break-words">{row.metric}</span>
                  </td>
                  <td className="max-w-[10rem] px-4 py-3 text-slate-600">
                    <span className="block break-words">
                      {row.facility ?? "All facilities"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                    {row.actual.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                    {row.target.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <RagIndicator status={row.rag} />
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}
