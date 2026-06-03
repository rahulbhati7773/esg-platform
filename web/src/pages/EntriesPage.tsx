import { motion } from "framer-motion";
import { FilePlus2, Table2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFacilities, getMetrics } from "../api.js";
import { EntriesTable } from "../components/EntriesTable.js";
import { Toast } from "../components/Toast.js";
import { useAuth } from "../context/AuthContext.js";
import { staggerContainer, staggerItem } from "../lib/motion.js";
import type { EsgEntry, Facility, Metric } from "../types.js";

export function EntriesPage() {
  const { user } = useAuth();
  const canCreate = user?.role === "data-entry";

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshEntries = useCallback(() => setRefreshToken((t) => t + 1), []);

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
        const [fList, mList] = await Promise.all([getFacilities(), getMetrics()]);
        setFacilities(fList);
        setMetrics(mList);
      } catch {
        setLoadError("Could not load facilities and metrics.");
      }
    })();
  }, []);

  // EntriesPage is view-only for admin/auditor — no edit action
  const handleEdit = useCallback(
    (entry: EsgEntry) => {
      if (canCreate) {
        // data-entry role can still edit, show toast if locked
        if (entry.status === "locked") {
          showToast("This record is locked and cannot be edited.", "error");
        }
      }
    },
    [canCreate, showToast],
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1200px] space-y-5 sm:space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
            <Table2 className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">
              {canCreate ? "My Entries" : "All Entries"}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {canCreate
                ? "View and manage your submitted ESG records"
                : "Browse all ESG records across facilities"}
            </p>
          </div>
        </div>

        {canCreate && (
          <Link
            to="/entries/new"
            className="btn-primary flex shrink-0 items-center gap-2"
          >
            <FilePlus2 className="h-4 w-4" />
            <span className="hidden sm:inline">New entry</span>
          </Link>
        )}
      </motion.div>

      {loadError && (
        <motion.p
          variants={staggerItem}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {loadError}
        </motion.p>
      )}

      <motion.div variants={staggerItem}>
        <EntriesTable
          facilities={facilities}
          metrics={metrics}
          refreshToken={refreshToken}
          onEdit={handleEdit}
          onEntriesChange={refreshEntries}
        />
      </motion.div>

      {toast && <Toast message={toast.message} variant={toast.variant} />}
    </motion.div>
  );
}
