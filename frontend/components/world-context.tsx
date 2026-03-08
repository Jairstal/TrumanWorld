"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import useSWR from "swr";
import { buildApiUrl, fetchApiResult, type ApiResult } from "@/lib/api";
import type { WorldSnapshot } from "@/lib/types";

type WorldContextValue = {
  runId: string;
  world: WorldSnapshot | null;
  error: string | null;
  isValidating: boolean;
  refresh: () => void;
};

const WorldContext = createContext<WorldContextValue | null>(null);

export function useWorld() {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error("useWorld must be used within a WorldProvider");
  }
  return context;
}

type Props = {
  runId: string;
  initialData?: WorldSnapshot | null;
  children: ReactNode;
};

export function WorldProvider({ runId, initialData, children }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: result, isValidating, mutate } = useSWR<ApiResult<WorldSnapshot>>(
    isClient ? buildApiUrl(`/runs/${runId}/world`) : null,
    fetchApiResult,
    {
      fallbackData: {
        data: initialData ?? null,
        error: null,
        status: initialData ? 200 : null,
      },
      refreshInterval: (snapshot) => (snapshot?.data?.run.status === "running" ? 5000 : 0),
      revalidateOnFocus: true,
      revalidateOnMount: true,
    },
  );

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);

  const world = result?.data ?? null;
  const error = result?.error ?? null;

  return (
    <WorldContext.Provider value={{ runId, world: world ?? null, error, isValidating, refresh }}>
      {children}
    </WorldContext.Provider>
  );
}
