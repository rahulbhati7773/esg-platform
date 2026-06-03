import { Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { downloadExcelReport, getFacilities } from "../../api.js";
import { usePlatformFilters } from "../../context/PlatformContext.js";
import type { PeriodPreset } from "../../lib/periodPresets.js";
import type { Facility } from "../../types.js";
import { FormDatePicker } from "../ui/FormDatePicker.js";
import { FormSelect } from "../ui/FormSelect.js";
import { cn } from "../../lib/cn.js";

const PRESET_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: "rolling12", label: "Last 12 months" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual (2025)" },
  { value: "custom", label: "Custom range" },
];

export function GlobalControllerPanel() {
  const {
    period,
    setPeriod,
    periodPreset,
    setPeriodPreset,
    facilityIds,
    setFacilityIds,
    facilityId,
  } = usePlatformFilters();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    void getFacilities()
      .then(setFacilities)
      .catch(() => setFacilities([]));
  }, []);

  const toggleFacility = (id: number) => {
    setFacilityIds(
      facilityIds.includes(id)
        ? facilityIds.filter((f) => f !== id)
        : [...facilityIds, id],
    );
  };

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadExcelReport(period, facilityId);
    } catch {
      setExportError(
        "Could not generate the report. Check that the API is running.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="surface-card mb-6 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Report filters
          </h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            {period.periodStart} – {period.periodEnd}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={exporting}
          className="btn-primary w-full shrink-0 sm:w-auto"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? "Preparing…" : "Export report"}
        </button>
      </div>

      {exportError && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {exportError}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
        <div className="flex shrink-0 flex-wrap items-end gap-3">
          <div className="w-full min-w-[160px] sm:w-[180px]">
            <label className="label-caps" htmlFor="period-preset">
              Period
            </label>
            <FormSelect
              id="period-preset"
              value={periodPreset}
              onValueChange={(value) => setPeriodPreset(value as PeriodPreset)}
              aria-label="Reporting period preset"
              options={PRESET_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </div>

          {periodPreset === "custom" && (
            <>
              <div className="w-full min-w-[150px] sm:w-[150px]">
                <label className="label-caps" htmlFor="period-from">
                  From
                </label>
                <FormDatePicker
                  id="period-from"
                  value={period.periodStart}
                  onChange={(value) =>
                    setPeriod({ ...period, periodStart: value })
                  }
                  placeholder="Start date"
                  aria-label="Period start"
                />
              </div>
              <div className="w-full min-w-[150px] sm:w-[150px]">
                <label className="label-caps" htmlFor="period-to">
                  To
                </label>
                <FormDatePicker
                  id="period-to"
                  value={period.periodEnd}
                  onChange={(value) =>
                    setPeriod({ ...period, periodEnd: value })
                  }
                  placeholder="End date"
                  aria-label="Period end"
                />
              </div>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className="label-caps">Facilities</span>
          <div className="overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:thin]">
            <div className="flex flex-nowrap gap-2">
              <button
                type="button"
                onClick={() => setFacilityIds([])}
                className={cn(
                  "chip shrink-0 whitespace-nowrap",
                  facilityIds.length === 0 && "chip-active",
                )}
              >
                All sites
              </button>
              {facilities.map((facility) => {
                const selected = facilityIds.includes(facility.id);
                return (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => toggleFacility(facility.id)}
                    className={cn(
                      "chip shrink-0 whitespace-nowrap",
                      selected && "chip-active",
                    )}
                  >
                    {facility.name}
                  </button>
                );
              })}
            </div>
          </div>
          {facilityIds.length > 1 && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Multiple sites selected — charts filter by the first site.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
