import {
  BadgeDelta,
  Card,
  Flex,
  Metric,
  Text,
} from "@tremor/react";
import { useEffect, useState } from "react";
import { getKpis } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";
import type { KpiSummaryItem } from "../../types.js";
import {
  deltaTypeForChange,
  formatDeltaPercent,
  formatKpiValue,
  isIncreasePositiveForKpi,
  KPI_DISPLAY,
  KPI_KEYS,
  matchKpiItem,
} from "../../utils/kpiConfig.js";

export function KpiCards() {
  const { period, facilityId } = useDashboardPeriod();
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
          setError("Failed to load KPI summary");
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {KPI_KEYS.map((key) => {
        const config = KPI_DISPLAY[key];
        const item = matchKpiItem(kpis, key);

        return (
          <Card key={key}>
            <Text>{config.label}</Text>
            {loading && <Metric className="mt-2">…</Metric>}
            {error && (
              <Text className="mt-2 text-sm text-red-600">{error}</Text>
            )}
            {!loading && !error && (
              <>
                <Metric className="mt-2">
                  {item
                    ? formatKpiValue(item.total, item.unit)
                    : "—"}
                </Metric>
                {item && (
                  <Flex className="mt-3 justify-start">
                    <BadgeDelta
                      deltaType={deltaTypeForChange(
                        item.delta,
                        item.deltaPercent,
                      )}
                      isIncreasePositive={isIncreasePositiveForKpi(key)}
                    >
                      {formatDeltaPercent(item.deltaPercent)}
                    </BadgeDelta>
                  </Flex>
                )}
                {!item && (
                  <Text className="mt-2 text-sm text-gray-500">
                    No data for period
                  </Text>
                )}
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
