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
    <div className="gov-card gov-card-accent p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gov-accent">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <h3 className="text-sm font-bold text-gov-800 tracking-wide">Reporting Period</h3>
        <span className="ml-1 text-xs text-[--text-muted]">— All dashboard panels use this filter</span>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="gov-label">Period Start</label>
          <input
            type="date"
            value={period.periodStart}
            onChange={(e) => setPeriod({ ...period, periodStart: e.target.value })}
            className="gov-input w-auto"
          />
        </div>
        <div>
          <label className="gov-label">Period End</label>
          <input
            type="date"
            value={period.periodEnd}
            onChange={(e) => setPeriod({ ...period, periodEnd: e.target.value })}
            className="gov-input w-auto"
          />
        </div>
        <div>
          <label className="gov-label">Facility</label>
          <select
            value={facilityId ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setFacilityId(value === "" ? undefined : Number(value));
            }}
            className="gov-select w-auto min-w-[180px]"
          >
            <option value="">All facilities</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>
        <div className="pb-0.5">
          <ExportReportButton />
        </div>
      </div>
    </div>
  );
}
