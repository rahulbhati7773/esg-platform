import { useCallback, useEffect, useState } from "react";
import { getFacilities, getMetrics } from "../api.js";
import { EntriesTable } from "../components/EntriesTable.js";
import { EntryForm } from "../components/EntryForm.js";
import { Toast } from "../components/Toast.js";
import type { EsgEntry, Facility, Metric } from "../types.js";

export function DataEntry() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [editingEntry, setEditingEntry] = useState<EsgEntry | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshEntries = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  const showToast = useCallback(
    (message: string, variant: "success" | "error" = "success") => {
      setToast({ message, variant });
      window.setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  useEffect(() => {
    void (async () => {
      try {
        const [facilityList, metricList] = await Promise.all([
          getFacilities(),
          getMetrics(),
        ]);
        setFacilities(facilityList);
        setMetrics(metricList);
      } catch {
        setLoadError("Failed to load facilities and metrics from the API.");
      }
    })();
  }, []);

  const handleEdit = (entry: EsgEntry) => {
    if (entry.status === "locked") {
      showToast("Locked entries cannot be edited", "error");
      return;
    }
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-6 rounded-full bg-gold-400" />
          <span className="text-xs font-bold tracking-[0.1em] uppercase text-gov-600">
            Data Management
          </span>
        </div>
        <h1 className="section-title text-2xl sm:text-3xl">
          ESG Data Entry
        </h1>
        <p className="mt-1.5 text-sm text-[--text-muted] max-w-xl">
          Capture, validate, and manage ESG metric entries across facilities with
          full audit trail and status workflow.
        </p>
      </div>

      {loadError && (
        <div className="gov-card p-4 border-red-200 bg-red-50 text-red-800 text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {loadError}
        </div>
      )}

      <EntryForm
        facilities={facilities}
        metrics={metrics}
        editingEntry={editingEntry}
        onSuccess={(message) => {
          showToast(message);
          setEditingEntry(null);
          refreshEntries();
        }}
        onError={(message) => showToast(message, "error")}
        onCancelEdit={() => setEditingEntry(null)}
      />

      <EntriesTable
        facilities={facilities}
        metrics={metrics}
        refreshToken={refreshToken}
        onEdit={handleEdit}
        onEntriesChange={refreshEntries}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} />}
    </div>
  );
}
