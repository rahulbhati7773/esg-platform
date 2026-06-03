import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FilePlus2,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEntry, getFacilities, getMetrics, isApiError } from "../api.js";
import { FormDatePicker } from "../components/ui/FormDatePicker.js";
import { useAuth } from "../context/AuthContext.js";
import { cn } from "../lib/cn.js";
import type { Facility, Metric } from "../types.js";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
  }),
};

const STEPS = ["Facility & Metric", "Period & Value", "Review & Submit"] as const;

// ── Step 1: Facility & Metric ───────────────────────────────────────────────

function Step1({
  facilities,
  metrics,
  facilityId,
  metricId,
  onFacility,
  onMetric,
}: {
  facilities: Facility[];
  metrics: Metric[];
  facilityId: number | null;
  metricId: number | null;
  onFacility: (id: number) => void;
  onMetric: (id: number) => void;
}) {
  const categories = useMemo(() => {
    const cats = new Map<number, { name: string; metrics: Metric[] }>();
    for (const m of metrics) {
      if (!cats.has(m.categoryId)) {
        cats.set(m.categoryId, { name: m.category.name, metrics: [] });
      }
      cats.get(m.categoryId)!.metrics.push(m);
    }
    return [...cats.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [metrics]);

  const [activeCat, setActiveCat] = useState<string>(
    categories[0]?.name ?? "",
  );

  const visibleMetrics = useMemo(
    () =>
      categories.find((c) => c.name === activeCat)?.metrics ?? [],
    [categories, activeCat],
  );

  return (
    <div className="space-y-6">
      {/* Facilities */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">
          Select facility
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {facilities.map((f) => {
            const active = facilityId === f.id;
            return (
              <motion.button
                key={f.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onFacility(f.id)}
                className={cn(
                  "relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)]",
                )}
              >
                <span className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                  active ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-elevated)] text-[var(--text-muted)]",
                )}>
                  <Building2 className="h-4 w-4" />
                </span>
                <span className={cn(
                  "text-xs font-semibold leading-tight",
                  active ? "text-[var(--text)]" : "text-[var(--text-muted)]",
                )}>
                  {f.name}
                </span>
                {f.location && (
                  <span className="text-[10px] text-[var(--text-subtle)]">{f.location}</span>
                )}
                {active && (
                  <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)]">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Metric category tabs */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">
          Select metric
        </h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCat(cat.name)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                activeCat === cat.name
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-muted)] text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visibleMetrics.map((m) => {
            const active = metricId === m.id;
            return (
              <motion.button
                key={m.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onMetric(m.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)]",
                )}
              >
                <div>
                  <p className={cn("text-xs font-semibold", active ? "text-[var(--text)]" : "text-[var(--text-muted)]")}>
                    {m.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-subtle)]">{m.unit}</p>
                </div>
                {active && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Period & Value ──────────────────────────────────────────────────

function Step2({
  periodStart,
  periodEnd,
  value,
  unit,
  onChange,
}: {
  periodStart: string;
  periodEnd: string;
  value: string;
  unit: string;
  onChange: (field: "periodStart" | "periodEnd" | "value", val: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">
          Reporting period
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Start date
            </label>
            <FormDatePicker
              id="wizard-period-start"
              value={periodStart}
              onChange={(v) => onChange("periodStart", v)}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              End date
            </label>
            <FormDatePicker
              id="wizard-period-end"
              value={periodEnd}
              onChange={(v) => onChange("periodEnd", v)}
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>
        {periodStart && periodEnd && new Date(periodEnd) < new Date(periodStart) && (
          <p className="mt-2 text-xs text-[var(--danger)]">
            End date must be on or after start date.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">
          Measured value
        </h3>
        <div className="flex items-center gap-0">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange("value", e.target.value)}
            placeholder="0"
            className="input-field flex-1 rounded-r-none border-r-0"
            step="any"
          />
          {unit && (
            <span className="flex h-10 items-center rounded-r-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-xs font-medium text-[var(--text-muted)]">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Source & Review ─────────────────────────────────────────────────

function Step3({
  source,
  enteredBy,
  onSource,
  onEnteredBy,
  summary,
}: {
  source: string;
  enteredBy: string;
  onSource: (v: string) => void;
  onEnteredBy: (v: string) => void;
  summary: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">
          Review your entry
        </h3>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] divide-y divide-[var(--border)]">
          {summary.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-[var(--text-muted)]">{row.label}</span>
              <span className="text-xs font-semibold text-[var(--text)]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
            Source / reference <span className="text-[var(--text-subtle)]">(optional)</span>
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => onSource(e.target.value)}
            placeholder="e.g. Utility bill #2024-Q3"
            className="input-field w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
            Submitted by <span className="text-[var(--text-subtle)]">(optional)</span>
          </label>
          <input
            type="text"
            value={enteredBy}
            onChange={(e) => onEnteredBy(e.target.value)}
            placeholder="Your name"
            className="input-field w-full"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Wizard ─────────────────────────────────────────────────────────────

export function NewEntryWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // Form state
  const [facilityId, setFacilityId] = useState<number | null>(null);
  const [metricId, setMetricId] = useState<number | null>(null);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [value, setValue] = useState("");
  const [source, setSource] = useState("");
  const [enteredBy, setEnteredBy] = useState(user?.name ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([getFacilities(), getMetrics()]).then(([f, m]) => {
      setFacilities(f);
      setMetrics(m);
    });
  }, []);

  const selectedFacility = facilities.find((f) => f.id === facilityId);
  const selectedMetric = metrics.find((m) => m.id === metricId);

  function go(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  const step1Valid = facilityId !== null && metricId !== null;
  const step2Valid =
    periodStart !== "" &&
    periodEnd !== "" &&
    value !== "" &&
    !isNaN(parseFloat(value)) &&
    new Date(periodEnd) >= new Date(periodStart);

  function handlePeriodOrValue(
    field: "periodStart" | "periodEnd" | "value",
    val: string,
  ) {
    if (field === "periodStart") setPeriodStart(val);
    else if (field === "periodEnd") setPeriodEnd(val);
    else setValue(val);
  }

  const summary = [
    { label: "Facility", value: selectedFacility?.name ?? "—" },
    { label: "Metric", value: selectedMetric ? `${selectedMetric.name} (${selectedMetric.unit})` : "—" },
    { label: "Period", value: periodStart && periodEnd ? `${format(new Date(periodStart), "d MMM yyyy")} – ${format(new Date(periodEnd), "d MMM yyyy")}` : "—" },
    { label: "Value", value: value ? `${parseFloat(value).toLocaleString()} ${selectedMetric?.unit ?? ""}` : "—" },
  ];

  async function handleSubmit() {
    if (!facilityId || !metricId || !step2Valid) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createEntry({
        facilityId,
        metricId,
        value: parseFloat(value),
        periodStart,
        periodEnd,
        source: source || undefined,
        enteredBy: enteredBy || undefined,
      });
      navigate("/entries", {
        state: { toast: "Entry submitted successfully." },
      });
    } catch (err) {
      let msg = "Failed to submit entry. Please try again.";
      if (isApiError(err)) msg = err.response?.data?.error ?? msg;
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[640px]">
      {/* Back link */}
      <div className="mb-6 flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>
      </div>

      {/* Title */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
          <FilePlus2 className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">New ESG Entry</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  i < step
                    ? "bg-[var(--primary)] text-white"
                    : i === step
                      ? "bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20"
                      : "bg-[var(--surface-elevated)] text-[var(--text-subtle)] border border-[var(--border)]",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "mt-1 hidden text-[10px] font-medium sm:block",
                  i <= step ? "text-[var(--primary)]" : "text-[var(--text-subtle)]",
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 transition-colors duration-300",
                  i < step ? "bg-[var(--primary)]" : "bg-[var(--border)]",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="surface-card overflow-hidden p-5 sm:p-6">
        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: EASE }}
            >
              {step === 0 && (
                <Step1
                  facilities={facilities}
                  metrics={metrics}
                  facilityId={facilityId}
                  metricId={metricId}
                  onFacility={setFacilityId}
                  onMetric={setMetricId}
                />
              )}
              {step === 1 && (
                <Step2
                  periodStart={periodStart}
                  periodEnd={periodEnd}
                  value={value}
                  unit={selectedMetric?.unit ?? ""}
                  onChange={handlePeriodOrValue}
                />
              )}
              {step === 2 && (
                <Step3
                  source={source}
                  enteredBy={enteredBy}
                  onSource={setSource}
                  onEnteredBy={setEnteredBy}
                  summary={summary}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {submitError && (
          <p className="mt-3 text-sm text-[var(--danger)]">{submitError}</p>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text)] disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          {step < STEPS.length - 1 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => go(step + 1)}
              disabled={step === 0 ? !step1Valid : !step2Valid}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] disabled:pointer-events-none disabled:opacity-40"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Submit entry
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Step indicator dots (mobile) */}
      <div className="mt-4 flex justify-center gap-1.5 sm:hidden">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === step
                ? "w-4 bg-[var(--primary)]"
                : i < step
                  ? "w-1.5 bg-[var(--primary)]/40"
                  : "w-1.5 bg-[var(--border)]",
            )}
          />
        ))}
      </div>
    </div>
  );
}
