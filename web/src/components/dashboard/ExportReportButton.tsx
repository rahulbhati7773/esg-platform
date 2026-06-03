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
        className="gov-btn gov-btn-primary"
      >
        {loading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Exporting…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </>
        )}
      </button>
      {error && (
        <span className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
