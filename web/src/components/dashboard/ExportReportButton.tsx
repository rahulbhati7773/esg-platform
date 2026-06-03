import { useState } from "react";
import { downloadExcelReport } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";

export function ExportReportButton() {
  const { period, facilityId } = useDashboardPeriod();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      await downloadExcelReport(period, facilityId);
    } catch {
      setError("Export failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={loading}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {loading ? "Exporting…" : "Export Report"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
