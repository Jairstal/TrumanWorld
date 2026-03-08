"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import useSWR from "swr";
import type { WorldSnapshot } from "@/lib/api";

const API_BASE =
  (typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined) ??
  "http://127.0.0.1:8000/api";

async function worldFetcher(url: string): Promise<WorldSnapshot | null> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Failed to load world snapshot: ${response.status}`);
  }
  return response.json() as Promise<WorldSnapshot>;
}

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

  // 使用 runId 作为 key 的一部分，切换时自动重新获取
  const { data: world, error, isValidating, mutate } = useSWR<WorldSnapshot | null>(
    isClient ? `${API_BASE}/runs/${runId}/world` : null,
    worldFetcher,
    {
      fallbackData: initialData ?? null,
      refreshInterval: (snapshot) => (snapshot?.run.status === "running" ? 5000 : 0),
      revalidateOnFocus: true,
      revalidateOnMount: true,
    }
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
