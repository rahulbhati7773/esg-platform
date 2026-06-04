import { motion } from "framer-motion";
import { FilePlus2, Table2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFacilities, getMetrics } from "../api.js";
import { EntriesTable } from "../components/EntriesTable.js";
import { EntryForm } from "../components/EntryForm.js";
import { Toast } from "../components/Toast.js";
import { useAuth } from "../context/AuthContext.js";
import {
  canEditEntry,
  entryPermissionsForRole,
} from "../lib/entryPermissions.js";
import { staggerContainer, staggerItem } from "../lib/motion.js";
import type { EsgEntry, Facility, Metric } from "../types.js";

export function EntriesPage() {
  const { user } = useAuth();
  const role = user?.role ?? "data-entry";
  const permissions = entryPermissionsForRole(role);

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [editingEntry, setEditingEntry] = useState<EsgEntry | null>(null);
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

  const handleEdit = useCallback(
    (entry: EsgEntry) => {
      if (!canEditEntry(entry, permissions, role)) {
        if (entry.status === "locked") {
          showToast("This record is locked and cannot be edited.", "error");
        } else if (role === "data-entry" && entry.status !== "draft") {
          showToast("Only draft entries can be edited. Submit for review first.", "error");
        }
        return;
      }
      setEditingEntry(entry);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [permissions, role, showToast],
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="page-container space-y-5 sm:space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
            <Table2 className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[var(--text)] sm:text-xl">
              {permissions.canCreate ? "My Entries" : "All Entries"}
            </h1>
            <p className="break-words text-sm text-[var(--text-muted)]">
              {permissions.canCreate
                ? "Create and edit your ESG records until they are locked"
                : permissions.canChangeStatus
                  ? "Review entries and approve or lock them for audit"
                  : "Browse all ESG records across facilities"}
            </p>
          </div>
        </div>

        {permissions.canCreate && (
          <Link
            to="/entries/new"
            className="btn-primary flex shrink-0 items-center gap-2"
          >
            <FilePlus2 className="h-4 w-4" />
            <span className="hidden sm:inline">New entry</span>
          </Link>
        )}
      </motion.div>

      {permissions.canEdit && editingEntry && (
        <motion.div variants={staggerItem}>
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
        </motion.div>
      )}

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
