import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  periodFromPreset,
  type PeriodPreset,
} from "../lib/periodPresets.js";
import type { PeriodQuery } from "../types.js";
import type { AppRole } from "./AuthContext.js";

/** @deprecated Use AppRole from AuthContext */
export type UserRole = AppRole;

type PlatformContextValue = {
  period: PeriodQuery;
  setPeriod: (period: PeriodQuery) => void;
  periodPreset: PeriodPreset;
  setPeriodPreset: (preset: PeriodPreset) => void;
  facilityIds: number[];
  setFacilityIds: (ids: number[]) => void;
  /** Single ID for API when exactly one facility is selected. */
  facilityId: number | undefined;
  role: UserRole;
  setRole: (role: UserRole) => void;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformFilterProvider({ children }: { children: ReactNode }) {
  const [periodPreset, setPeriodPresetState] = useState<PeriodPreset>("rolling12");
  const [period, setPeriod] = useState<PeriodQuery>(() =>
    periodFromPreset("rolling12"),
  );
  const [facilityIds, setFacilityIds] = useState<number[]>([]);
  const [role, setRole] = useState<UserRole>("data-entry");

  const setPeriodPreset = useCallback((preset: PeriodPreset) => {
    setPeriodPresetState(preset);
    if (preset !== "custom") {
      setPeriod(periodFromPreset(preset));
    }
  }, []);

  const facilityId =
    facilityIds.length === 1
      ? facilityIds[0]
      : facilityIds.length > 1
        ? facilityIds[0]
        : undefined;

  const value = useMemo(
    () => ({
      period,
      setPeriod,
      periodPreset,
      setPeriodPreset,
      facilityIds,
      setFacilityIds,
      facilityId,
      role,
      setRole,
    }),
    [period, periodPreset, facilityIds, facilityId, role, setPeriodPreset],
  );

  return (
    <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
  );
}

export function usePlatformFilters(): PlatformContextValue {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatformFilters must be used within PlatformFilterProvider");
  }
  return context;
}

/** @deprecated Use usePlatformFilters */
export function useDashboardPeriod() {
  const ctx = usePlatformFilters();
  return {
    period: ctx.period,
    setPeriod: ctx.setPeriod,
    facilityId: ctx.facilityId,
    setFacilityId: (id: number | undefined) =>
      ctx.setFacilityIds(id === undefined ? [] : [id]),
  };
}
