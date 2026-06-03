import { Metric } from "@tremor/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getKpis } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { staggerContainer, staggerItem } from "../../lib/motion.js";
import { DeltaPill } from "../ui/DeltaPill.js";
import { PanelCard } from "../ui/PanelCard.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { KpiSummaryItem } from "../../types.js";
import {
  formatKpiValue,
  KPI_DISPLAY,
  KPI_KEYS,
  matchKpiItem,
} from "../../utils/kpiConfig.js";

export function KpiCards() {
  const { period, facilityId } = usePlatformFilters();
  const [kpis, setKpis] = useState<KpiSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void getKpis(period, facilityId)
      .then((data) => {
        if (!cancelled) {
          setKpis(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load summary metrics.");
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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {KPI_KEYS.map((key) => {
        const config = KPI_DISPLAY[key];
        const item = matchKpiItem(kpis, key);

        return (
          <motion.div key={key} variants={staggerItem}>
            <PanelCard interactive className="h-full">
              <p className="text-sm font-medium text-slate-500">
                {config.label}
              </p>

              {loading && (
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}

              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}

              {!loading && !error && (
                <>
                  <Metric className="mt-2 text-2xl text-slate-900">
                    {item ? formatKpiValue(item.total, item.unit) : "—"}
                  </Metric>
                  {item && (
                    <div className="mt-3">
                      <DeltaPill
                        deltaPercent={item.deltaPercent}
                        kpiKey={key}
                      />
                    </div>
                  )}
                  {!item && (
                    <p className="mt-2 text-sm text-slate-400">
                      No data for this period
                    </p>
                  )}
                </>
              )}
            </PanelCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
