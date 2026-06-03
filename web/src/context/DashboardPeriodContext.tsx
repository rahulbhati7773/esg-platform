import { format, startOfMonth, subMonths } from "date-fns";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PeriodQuery } from "../types.js";

function defaultPeriod(): PeriodQuery {
  const end = startOfMonth(new Date());
  const start = subMonths(end, 11);
  return {
    periodStart: format(start, "yyyy-MM-dd"),
    periodEnd: format(end, "yyyy-MM-dd"),
  };
}

type DashboardPeriodContextValue = {
  period: PeriodQuery;
  setPeriod: (period: PeriodQuery) => void;
  facilityId: number | undefined;
  setFacilityId: (facilityId: number | undefined) => void;
};

const DashboardPeriodContext = createContext<DashboardPeriodContextValue | null>(
  null,
);

export function DashboardPeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PeriodQuery>(defaultPeriod);
  const [facilityId, setFacilityId] = useState<number | undefined>(undefined);
  const value = useMemo(
    () => ({ period, setPeriod, facilityId, setFacilityId }),
    [period, facilityId],
  );

  return (
    <DashboardPeriodContext.Provider value={value}>
      {children}
    </DashboardPeriodContext.Provider>
  );
}

export function useDashboardPeriod(): DashboardPeriodContextValue {
  const context = useContext(DashboardPeriodContext);
  if (!context) {
    throw new Error("useDashboardPeriod must be used within DashboardPeriodProvider");
  }
  return context;
}
