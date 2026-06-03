import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/cn.js";
import { staggerItem } from "../../lib/motion.js";
import { Skeleton } from "../ui/Skeleton.js";

export type KpiStatCardProps = {
  label: string;
  value: string;
  loading?: boolean;
  icon: LucideIcon;
  iconClassName?: string;
  trendText?: string;
  trendPositive?: boolean;
};

export function KpiStatCard({
  label,
  value,
  loading = false,
  icon: Icon,
  iconClassName,
  trendText,
  trendPositive = true,
}: KpiStatCardProps) {
  return (
    <motion.div variants={staggerItem} className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-3 h-9 w-28" />
          ) : (
            <p className="mt-2 truncate text-2xl font-bold tabular-nums tracking-tight text-[var(--text)]">
              {value}
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)]">
          <Icon
            className={cn("h-5 w-5", iconClassName ?? "text-[var(--primary)]")}
            aria-hidden
          />
        </div>
      </div>

      {!loading && trendText && (
        <p
          className={cn(
            "mt-4 flex items-center gap-1.5 text-xs font-medium",
            trendPositive
              ? "text-green-700 dark:text-green-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {trendPositive ? (
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
          )}
          {trendText}
        </p>
      )}
    </motion.div>
  );
}
