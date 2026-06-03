import { Text, Title } from "@tremor/react";
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
    <div className="space-y-6">
      <div>
        <Title>Data Entry</Title>
        <Text className="mt-2">
          Capture and manage ESG entries with validation and status workflow.
        </Text>
      </div>

      {loadError && <Text className="text-red-600">{loadError}</Text>}

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
