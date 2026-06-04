import { cn } from "../../lib/cn.js";
import type { RagStatus } from "../../types.js";

const RAG_STYLES: Record<
  RagStatus,
  { dot: string; text: string; label: string }
> = {
  green: {
    dot: "bg-green-600",
    text: "text-green-800",
    label: "On track",
  },
  amber: {
    dot: "bg-amber-500",
    text: "text-amber-800",
    label: "Watch",
  },
  red: {
    dot: "bg-red-600",
    text: "text-red-800",
    label: "Off track",
  },
};

type RagIndicatorProps = {
  status: RagStatus;
};

export function RagIndicator({ status }: RagIndicatorProps) {
  const styles = RAG_STYLES[status];

  return (
    <span
      className="inline-flex items-center gap-2"
      title={styles.label}
      aria-label={styles.label}
    >
      <span
        className={cn("h-2.5 w-2.5 rounded-full", styles.dot)}
        aria-hidden
      />
      <span className={cn("text-sm font-medium capitalize", styles.text)}>
        {status}
      </span>
    </span>
  );
}
