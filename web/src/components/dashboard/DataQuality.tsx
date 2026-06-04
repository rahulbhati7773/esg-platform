import { motion } from "framer-motion";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDataQuality } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import { PanelCard } from "../ui/PanelCard.js";
import { Skeleton } from "../ui/Skeleton.js";
import type { DataQualitySummary } from "../../types.js";

function percent(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((part / total) * 1000) / 10;
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const size = 128;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${value}%`}
    >
      <svg
        width={size}
        height={size}
        className="block -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-[var(--border)]"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
          className="text-[var(--primary)]"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-semibold leading-none tabular-nums text-[var(--text)]">
          {value}%
        </p>
        <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
          {label}
        </p>
      </div>
    </div>
  );
}

export function DataQuality() {
  const { period, facilityId } = usePlatformFilters();
  const [quality, setQuality] = useState<DataQualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void getDataQuality(period, facilityId)
      .then((data) => {
        if (!cancelled) {
          setQuality(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load data quality.");
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

  const stats = useMemo(() => {
    if (!quality) {
      return null;
    }
    const total = Object.values(quality.countsByStatus).reduce(
      (sum, count) => sum + count,
      0,
    );
    const submitted = quality.countsByStatus.submitted ?? 0;
    const approved = quality.countsByStatus.approved ?? 0;

    return {
      total,
      submittedPct: percent(submitted, total),
      approvedPct: percent(approved, total),
    };
  }, [quality]);

  return (
    <PanelCard>
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-2">
          <ClipboardCheck className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)]">
            Data quality
          </h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Submission completeness and gaps to fix.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-wrap justify-center gap-8">
          {loading ? (
            <>
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-32 w-32 rounded-full" />
            </>
          ) : stats ? (
            <>
              <ProgressRing value={stats.submittedPct} label="Submitted" />
              <ProgressRing value={stats.approvedPct} label="Approved" />
            </>
          ) : null}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[var(--text)]">
            Missing records
          </h4>

          {loading && (
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          )}

          {!loading && quality && quality.missing.length === 0 && (
            <p className="mt-3 text-sm text-green-700 dark:text-green-400">
              All expected combinations have data.
            </p>
          )}

          {!loading && quality && quality.missing.length > 0 && (
            <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto">
              {quality.missing.slice(0, 12).map((item, index) => (
                <motion.li
                  key={`${item.facilityId}-${item.metricId}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
                >
                  <span className="text-[var(--text)]">
                    {item.facility} — {item.metric}
                  </span>
                  <Link
                    to={`/data-entry?facilityId=${item.facilityId}&metricId=${item.metricId}`}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:opacity-80"
                  >
                    Add data
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PanelCard>
  );
}
