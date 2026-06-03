import { Card, Grid, Metric, ProgressBar, Text, Title } from "@tremor/react";
import { useEffect, useMemo, useState } from "react";
import { getDataQuality } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";
import type { DataQualitySummary } from "../../types.js";

function percent(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((part / total) * 1000) / 10;
}

export function DataQuality() {
  const { period, facilityId } = useDashboardPeriod();
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
          setError("Failed to load data quality");
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
    <div className="space-y-4">
      <Grid numItems={1} numItemsSm={2} className="gap-4">
        <Card>
          <Text>Submitted</Text>
          {loading && <Metric className="mt-2">…</Metric>}
          {!loading && stats && (
            <>
              <Metric className="mt-2">{stats.submittedPct}%</Metric>
              <ProgressBar
                value={stats.submittedPct}
                className="mt-3"
                color="blue"
              />
            </>
          )}
        </Card>
        <Card>
          <Text>Approved</Text>
          {loading && <Metric className="mt-2">…</Metric>}
          {!loading && stats && (
            <>
              <Metric className="mt-2">{stats.approvedPct}%</Metric>
              <ProgressBar
                value={stats.approvedPct}
                className="mt-3"
                color="emerald"
              />
            </>
          )}
        </Card>
      </Grid>

      <Card>
        <Title>Missing data</Title>
        <Text className="mt-1 text-gray-600">
          Facility × metric combinations with no entry in the reporting period.
        </Text>

        {error && <Text className="mt-3 text-sm text-red-600">{error}</Text>}

        {loading && <Text className="mt-4">Loading…</Text>}

        {!loading && quality && quality.missing.length === 0 && (
          <Text className="mt-4 text-emerald-700">
            No missing combinations for this period.
          </Text>
        )}

        {!loading && quality && quality.missing.length > 0 && (
          <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm text-gray-700">
            {quality.missing.map((item) => (
              <li key={`${item.facilityId}-${item.metricId}`}>
                {item.facility} — {item.metric}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
