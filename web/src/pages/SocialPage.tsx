import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Activity,
  BookOpen,
  Briefcase,
  ClipboardList,
  FileWarning,
  Heart,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getMetrics, getTrend } from "../api.js";
import { PanelCard } from "../components/ui/PanelCard.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { usePlatformFilters } from "../context/PlatformContext.js";
import { cn } from "../lib/cn.js";
import { staggerContainer, staggerItem } from "../lib/motion.js";
import type { Metric, TrendPoint } from "../types.js";

type MetricCard = {
  name: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  description: string;
};

const SOCIAL_META: Record<string, MetricCard> = {
  "LTIFR": {
    name: "LTIFR",
    icon: Activity,
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-50 dark:bg-red-400/10",
    description: "Lost Time Injury Frequency Rate",
  },
  "Training Hours": {
    name: "Training Hours",
    icon: BookOpen,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-50 dark:bg-sky-400/10",
    description: "Employee training hours delivered",
  },
  "Diversity": {
    name: "Diversity",
    icon: Users,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-400/10",
    description: "Workforce diversity percentage",
  },
  "Community Spend": {
    name: "Community Spend",
    icon: Heart,
    iconColor: "text-pink-600 dark:text-pink-400",
    iconBg: "bg-pink-50 dark:bg-pink-400/10",
    description: "Investment in community programmes",
  },
};

const GOVERNANCE_META: Record<string, MetricCard> = {
  "Compliance Incidents": {
    name: "Compliance Incidents",
    icon: ShieldAlert,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-400/10",
    description: "Regulatory compliance breaches logged",
  },
  "Audit Findings": {
    name: "Audit Findings",
    icon: ClipboardList,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-50 dark:bg-orange-400/10",
    description: "Internal and external audit findings",
  },
};

const TREND_COLORS: Record<string, string> = {
  "LTIFR": "#ef4444",
  "Training Hours": "#0ea5e9",
  "Diversity": "#7c3aed",
  "Community Spend": "#ec4899",
  "Compliance Incidents": "#d97706",
  "Audit Findings": "#ea580c",
};

const RANGE_2025 = { start: "2025-01-01", end: "2025-12-31" };

function SparkCard({
  metric,
  meta,
  trendData,
  loading,
}: {
  metric: Metric;
  meta: MetricCard;
  trendData: TrendPoint[];
  loading: boolean;
}) {
  const Icon = meta.icon;
  const color = TREND_COLORS[metric.name] ?? "#2d9c72";

  const aggregated = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const pt of trendData) {
      const key = format(new Date(pt.periodStart), "MMM");
      byMonth.set(key, (byMonth.get(key) ?? 0) + pt.value);
    }
    return [...byMonth.entries()].map(([month, value]) => ({ month, value }));
  }, [trendData]);

  const total = aggregated.reduce((s, d) => s + d.value, 0);
  const latest = aggregated[aggregated.length - 1]?.value ?? 0;
  const prev = aggregated[aggregated.length - 2]?.value ?? latest;
  const trend = latest > 0 && prev > 0 ? ((latest - prev) / prev) * 100 : 0;
  const trendUp = trend > 0;

  const isLower = ["LTIFR", "Compliance Incidents", "Audit Findings"].includes(metric.name);
  const isGoodTrend = isLower ? !trendUp : trendUp;

  return (
    <PanelCard className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", meta.iconBg)}>
            <Icon className={cn("h-4 w-4", meta.iconColor)} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">{metric.name}</p>
            <p className="text-[10px] text-[var(--text-subtle)]">{meta.description}</p>
          </div>
        </div>
        {trend !== 0 && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              isGoodTrend
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]",
            )}
          >
            {trendUp ? "+" : ""}{trend.toFixed(1)}%
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-16 w-full rounded-lg" />
      ) : (
        <>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">
              {total >= 1_000_000
                ? `${(total / 1_000_000).toFixed(1)}M`
                : total >= 1000
                  ? `${(total / 1000).toFixed(0)}k`
                  : total.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">
                {metric.unit} total
              </span>
            </p>
          </div>

          {aggregated.length > 1 && (
            <ResponsiveContainer width="100%" height={64}>
              <AreaChart data={aggregated} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [
                    v.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                    metric.unit,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#grad-${metric.id})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </PanelCard>
  );
}

export function SocialPage() {
  usePlatformFilters();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [trendMap, setTrendMap] = useState<Map<number, TrendPoint[]>>(new Map());
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);

  const socialMetrics = useMemo(
    () => metrics.filter((m) => m.category.name === "Social"),
    [metrics],
  );
  const govMetrics = useMemo(
    () => metrics.filter((m) => m.category.name === "Governance"),
    [metrics],
  );

  useEffect(() => {
    setLoadingMetrics(true);
    getMetrics()
      .then(setMetrics)
      .catch(() => {})
      .finally(() => setLoadingMetrics(false));
  }, []);

  useEffect(() => {
    if (metrics.length === 0) return;
    const targets = metrics.filter(
      (m) => m.category.name === "Social" || m.category.name === "Governance",
    );
    if (targets.length === 0) return;

    setLoadingTrends(true);
    Promise.all(
      targets.map((m) =>
        getTrend(m.id, RANGE_2025)
          .then((data) => ({ id: m.id, data }))
          .catch(() => ({ id: m.id, data: [] as TrendPoint[] })),
      ),
    )
      .then((results) => {
        const map = new Map<number, TrendPoint[]>();
        for (const r of results) map.set(r.id, r.data);
        setTrendMap(map);
      })
      .finally(() => setLoadingTrends(false));
  }, [metrics]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1100px] space-y-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-400/10">
          <Briefcase className="h-5 w-5 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">People & Governance</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Social responsibility and governance compliance metrics
          </p>
        </div>
      </motion.div>

      {/* Social section */}
      <motion.div variants={staggerItem} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="text-sm font-semibold text-[var(--text)]">Social</h2>
          </div>
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-subtle)]">
            Workforce, safety & community
          </span>
        </div>

        {loadingMetrics ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {socialMetrics.map((m) => {
              const meta = SOCIAL_META[m.name];
              if (!meta) return null;
              return (
                <SparkCard
                  key={m.id}
                  metric={m}
                  meta={meta}
                  trendData={trendMap.get(m.id) ?? []}
                  loading={loadingTrends}
                />
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Governance section */}
      <motion.div variants={staggerItem} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileWarning className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="text-sm font-semibold text-[var(--text)]">Governance</h2>
          </div>
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-subtle)]">
            Compliance, audit & risk
          </span>
        </div>

        {loadingMetrics ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {govMetrics.map((m) => {
              const meta = GOVERNANCE_META[m.name];
              if (!meta) return null;
              return (
                <SparkCard
                  key={m.id}
                  metric={m}
                  meta={meta}
                  trendData={trendMap.get(m.id) ?? []}
                  loading={loadingTrends}
                />
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
