import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "../../lib/cn.js";
import type { KpiKey } from "../../utils/kpiConfig.js";
import { KPI_DISPLAY } from "../../utils/kpiConfig.js";

type DeltaPillProps = {
  deltaPercent: number | null;
  kpiKey: KpiKey;
};

export function DeltaPill({ deltaPercent, kpiKey }: DeltaPillProps) {
  if (deltaPercent === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
        <Minus className="h-3 w-3" />
        No prior period data
      </span>
    );
  }

  const lowerIsBetter = KPI_DISPLAY[kpiKey].lowerIsBetter;
  const isUp = deltaPercent > 0;
  const isDown = deltaPercent < 0;
  const favourable =
    (lowerIsBetter && isDown) || (!lowerIsBetter && isUp) || deltaPercent === 0;

  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
  const sign = deltaPercent > 0 ? "+" : "";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
        favourable
          ? "bg-green-50 text-green-800"
          : "bg-red-50 text-red-800",
      )}
    >
      <Icon className="h-3 w-3" />
      {sign}
      {Math.abs(deltaPercent).toFixed(1)}% vs previous period
    </span>
  );
}
