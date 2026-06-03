import { Card, Text, Title } from "@tremor/react";
import { useEffect, useState } from "react";
import { getFacilities } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";
import type { Facility } from "../../types.js";
import { ExportReportButton } from "./ExportReportButton.js";

export function PeriodSelector() {
  const { period, setPeriod, facilityId, setFacilityId } = useDashboardPeriod();
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    void getFacilities()
      .then(setFacilities)
      .catch(() => setFacilities([]));
  }, []);

  return (
    <Card>
      <Title>Reporting period</Title>
      <Text className="mt-1 text-gray-600">
        All dashboard panels use this date range and facility filter.
      </Text>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Period start
          </label>
          <input
            type="date"
            value={period.periodStart}
            onChange={(event) =>
              setPeriod({ ...period, periodStart: event.target.value })
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Period end
          </label>
          <input
            type="date"
            value={period.periodEnd}
            onChange={(event) =>
              setPeriod({ ...period, periodEnd: event.target.value })
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Facility
          </label>
          <select
            value={facilityId ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setFacilityId(value === "" ? undefined : Number(value));
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All facilities</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>
        <ExportReportButton />
      </div>
    </Card>
  );
}
