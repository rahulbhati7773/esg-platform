import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getFacilities, getMetrics } from "../api.js";
import { EntriesTable } from "../components/EntriesTable.js";
import { EntryForm } from "../components/EntryForm.js";
import { GlobalControllerPanel } from "../components/layout/GlobalControllerPanel.js";
import { Toast } from "../components/Toast.js";
import { staggerContainer } from "../lib/motion.js";
import type { EsgEntry, Facility, Metric } from "../types.js";

export function DataEntry() {
  const [searchParams] = useSearchParams();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [editingEntry, setEditingEntry] = useState<EsgEntry | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const prefillFacilityId = searchParams.get("facilityId");
  const prefillMetricId = searchParams.get("metricId");

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
        setLoadError("Could not load facilities and metrics.");
      }
    })();
  }, []);

  const handleEdit = (entry: EsgEntry) => {
    if (entry.status === "locked") {
      showToast("This record is locked and cannot be edited.", "error");
      return;
    }
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px] space-y-5 sm:space-y-6"
    >
      <header>
        <h2 className="text-xl font-semibold text-[var(--text)]">
          Data entry
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Capture readings and move them through your approval workflow.
        </p>
      </header>

      <GlobalControllerPanel />

      {loadError && (
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
      )}

      <div className="flex flex-col gap-6">
        <EntryForm
          facilities={facilities}
          metrics={metrics}
          editingEntry={editingEntry}
          prefillFacilityId={prefillFacilityId}
          prefillMetricId={prefillMetricId}
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
      </div>

      {toast && <Toast message={toast.message} variant={toast.variant} />}
    </motion.div>
  );
}
