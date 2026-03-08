"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import useSWR from "swr";
import { buildApiUrl, fetchApiOrThrow } from "@/lib/api";
import type { WorldSnapshot } from "@/lib/types";

type WorldContextValue = {
  runId: string;
  world: WorldSnapshot | null;
  error: Error | null;
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

  const { data: world, error, isValidating, mutate } = useSWR<WorldSnapshot | null>(
    isClient ? buildApiUrl(`/runs/${runId}/world`) : null,
    fetchApiOrThrow,
    {
      fallbackData: initialData ?? null,
      refreshInterval: (snapshot) => (snapshot?.run.status === "running" ? 5000 : 0),
      revalidateOnFocus: true,
      revalidateOnMount: true,
    },
  );

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);

  return (
    <WorldContext.Provider value={{ runId, world: world ?? null, error, isValidating, refresh }}>
      {children}
    </WorldContext.Provider>
  );
}
