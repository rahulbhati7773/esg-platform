import { motion } from "framer-motion";
import { Check, FileInput, Lock, Send } from "lucide-react";
import { cn } from "../../lib/cn.js";
import { springSnappy } from "../../lib/motion.js";
import type { EntryStatus } from "../../types.js";
import { STATUS_ORDER } from "../../utils/entryStatus.js";

const STATUS_META: Record<
  EntryStatus,
  { label: string; icon: typeof FileInput; className: string }
> = {
  draft: {
    label: "Draft",
    icon: FileInput,
    className: "bg-slate-100 text-slate-700",
  },
  submitted: {
    label: "Submitted",
    icon: Send,
    className: "bg-blue-50 text-blue-800",
  },
  approved: {
    label: "Approved",
    icon: Check,
    className: "bg-green-50 text-green-800",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    className: "bg-indigo-50 text-indigo-900",
  },
};

type StatusWorkflowProps = {
  status: EntryStatus;
  compact?: boolean;
  pulse?: boolean;
};

export function StatusWorkflow({
  status,
  compact = false,
  pulse = false,
}: StatusWorkflowProps) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  if (compact) {
    return (
      <motion.span
        animate={pulse ? { scale: [1, 1.03, 1] } : undefined}
        transition={springSnappy}
        className={cn(
          "inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
          meta.className,
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{meta.label}</span>
      </motion.span>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STATUS_ORDER.map((step, index) => {
        const stepMeta = STATUS_META[step];
        const StepIcon = stepMeta.icon;
        const active = index <= currentIndex;

        return (
          <span
            key={step}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              stepMeta.className,
              active ? "opacity-100" : "opacity-40",
            )}
          >
            <StepIcon className="h-3 w-3" aria-hidden />
            {stepMeta.label}
          </span>
        );
      })}
    </div>
  );
}
