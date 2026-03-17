import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { DemoAccessProvider } from "@/components/demo-access-provider";
import { RunsProvider } from "@/components/runs-provider";
import { fetchApiResult, getInternalApiBaseUrl, type ApiResult } from "@/lib/api";
import type { RunSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "Truman World",
  description: "观察、记录、注入事件——AI 居民们不知道自己是 AI | 楚门的世界 AI 版",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const runtimeConfig = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api",
  };
  const initialRunsResult: ApiResult<RunSummary[]> = await fetchApiResult<RunSummary[]>(
    `${getInternalApiBaseUrl()}/runs`,
  );

  return (
    <html lang="zh-CN">
      <body className="h-screen overflow-hidden">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__TRUMANWORLD_CONFIG__ = ${JSON.stringify(runtimeConfig)};`,
          }}
        />
        <DemoAccessProvider>
          <RunsProvider initialResult={initialRunsResult}>
            <AppShell>{children}</AppShell>
          </RunsProvider>
        </DemoAccessProvider>
      </body>
    </html>
  );
}
