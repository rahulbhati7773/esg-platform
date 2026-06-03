import { useEffect, useState } from "react";
import { apiClient } from "../api.js";

export type ConnectivityState = "online" | "offline" | "checking";

export function useApiConnectivity(pollMs = 30_000) {
  const [state, setState] = useState<ConnectivityState>("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        await apiClient.get("/health", { timeout: 5_000 });
        if (!cancelled) {
          setState("online");
        }
      } catch {
        if (!cancelled) {
          setState("offline");
        }
      }
    };

    void check();
    const id = window.setInterval(() => void check(), pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return state;
}
