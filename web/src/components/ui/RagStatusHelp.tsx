import { CircleHelp } from "lucide-react";
import { RAG_STATUS_RULES } from "../../lib/ragStatus.js";
import { cn } from "../../lib/cn.js";

const RAG_DOT: Record<(typeof RAG_STATUS_RULES)[number]["status"], string> = {
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

type RagStatusHelpProps = {
  className?: string;
  iconClassName?: string;
};

/**
 * ? control with hover/focus popover explaining RAG (not entry workflow status).
 */
export function RagStatusHelp({ className, iconClassName }: RagStatusHelpProps) {
  return (
    <span
      className={cn(
        "group/help relative inline-flex align-middle",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--text-subtle)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          iconClassName,
        )}
        aria-label="How Status (RAG) is calculated"
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden />
      </button>

      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute right-0 top-full z-50 mt-1.5 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left normal-case shadow-lg",
          "opacity-0 transition-opacity duration-150",
          "group-hover/help:opacity-100 group-focus-within/help:opacity-100",
        )}
      >
        <p className="text-xs font-semibold text-[var(--text)]">
          RAG status (Red, Amber, Green)
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
          Not entry workflow (draft/submitted). Compares{" "}
          <strong className="font-medium text-[var(--text)]">Actual</strong> (sum
          of entry values in your reporting period) to{" "}
          <strong className="font-medium text-[var(--text)]">Target</strong>.
          Lower actual is better for emissions-style metrics.
        </p>
        <ul className="mt-2.5 space-y-2">
          {RAG_STATUS_RULES.map((rule) => (
            <li key={rule.status} className="flex gap-2 text-[11px]">
              <span
                className={cn(
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  RAG_DOT[rule.status],
                )}
                aria-hidden
              />
              <span className="min-w-0 text-[var(--text-muted)]">
                <span className="font-semibold capitalize text-[var(--text)]">
                  {rule.status}
                </span>
                {" — "}
                {rule.label}
                <br />
                <span className="font-mono text-[10px] text-[var(--text-subtle)]">
                  {rule.formula}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </span>
  );
}
