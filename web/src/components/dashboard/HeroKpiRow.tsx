import { motion } from "framer-motion";
import { Droplets, LineChart, Recycle, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { getKpis } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { staggerContainer } from "../../lib/motion.js";
import type { KpiSummaryItem } from "../../types.js";
import {
  formatKpiValue,
  KPI_DISPLAY,
  type KpiKey,
  matchKpiItem,
} from "../../utils/kpiConfig.js";
import { KpiStatCard } from "./KpiStatCard.js";

const KPI_ORDER: KpiKey[] = ["emissions", "energy", "water", "waste"];

const KPI_ICONS = {
  emissions: { icon: LineChart, iconClassName: "text-brand-600 dark:text-brand-400" },
  energy: { icon: Zap, iconClassName: "text-violet-500 dark:text-violet-400" },
  water: { icon: Droplets, iconClassName: "text-sky-500 dark:text-sky-400" },
  waste: { icon: Recycle, iconClassName: "text-amber-600 dark:text-amber-400" },
} as const;

function trendCopy(
  deltaPercent: number | null,
  key: KpiKey,
): { text: string; positive: boolean } {
  if (deltaPercent === null) {
    return { text: "No prior period data", positive: true };
  }
  const lowerIsBetter = KPI_DISPLAY[key].lowerIsBetter;
  const up = deltaPercent > 0;
  const favourable =
    (lowerIsBetter && !up) || (!lowerIsBetter && up) || deltaPercent === 0;
  const abs = Math.abs(deltaPercent).toFixed(1);
  return {
    text: up ? `${abs}% up from last period` : `${abs}% down from last period`,
    positive: favourable,
  };
}

export function HeroKpiRow() {
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
          setError("Could not load KPIs.");
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
    <div>
      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {KPI_ORDER.map((key) => {
          const item = matchKpiItem(kpis, key);
          const config = KPI_DISPLAY[key];
          const icons = KPI_ICONS[key];
          const trend = item ? trendCopy(item.deltaPercent, key) : null;

          return (
            <KpiStatCard
              key={key}
              label={item?.metric ?? config.label}
              value={item ? formatKpiValue(item.total, item.unit) : "—"}
              loading={loading}
              icon={icons.icon}
              iconClassName={icons.iconClassName}
              trendText={!loading && item ? trend?.text : undefined}
              trendPositive={trend?.positive ?? true}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
