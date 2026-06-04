import { AnimatePresence, motion } from "framer-motion";
import { BarChart2, LineChart, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { fadeIn } from "../../lib/motion.js";
import { cn } from "../../lib/cn.js";
import type { Metric } from "../../types.js";
import { PanelCard } from "../ui/PanelCard.js";
import { ComplianceRagPanel } from "./ComplianceRagPanel.js";
import { FacilityComparison } from "./FacilityComparison.js";
import { EnvironmentalTrends } from "./EnvironmentalTrends.js";

const TABS = [
  { id: "trends", label: "Trends", icon: LineChart },
  { id: "facilities", label: "By facility", icon: BarChart2 },
  { id: "compliance", label: "Targets", icon: ShieldCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

type AnalyticsTabsProps = {
  metrics: Metric[];
};

export function AnalyticsTabs({ metrics }: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("trends");

  return (
    <PanelCard className="p-0 overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 pt-4">
        <h2 className="text-sm font-semibold text-slate-800">Analytics</h2>
        <p className="text-sm text-slate-500">
          Explore trends, compare sites, and review targets.
        </p>
        <div className="mt-3 flex flex-wrap gap-1 pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === id
                  ? "text-teal-800"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {activeTab === id && (
                <motion.span
                  layoutId="analyticsTab"
                  className="absolute inset-0 rounded-t-lg border border-b-0 border-slate-200 bg-white"
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                />
              )}
              <Icon className="relative h-4 w-4" aria-hidden />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} {...fadeIn}>
            {activeTab === "trends" && (
              <EnvironmentalTrends metrics={metrics} />
            )}
            {activeTab === "facilities" && (
              <FacilityComparison metrics={metrics} />
            )}
            {activeTab === "compliance" && <ComplianceRagPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </PanelCard>
  );
}
