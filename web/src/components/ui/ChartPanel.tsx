import type { ReactNode } from "react";
import { PanelCard } from "./PanelCard.js";

type ChartPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  controls?: ReactNode;
};

export function ChartPanel({
  title,
  description,
  children,
  controls,
}: ChartPanelProps) {
  return (
    <PanelCard interactive>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {controls}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Hover chart points for values · Use controls to refine the view
      </p>
      <div className="mt-4">{children}</div>
    </PanelCard>
  );
}
