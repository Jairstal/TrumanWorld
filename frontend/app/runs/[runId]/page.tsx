import Link from "next/link";

import { MetricChip } from "@/components/metric-chip";
import { SectionCard } from "@/components/section-card";
import { getRun } from "@/lib/api";

type RunPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function RunPage({ params }: RunPageProps) {
  const { runId } = await params;
  const run = await getRun(runId);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <Link href="/" className="text-sm uppercase tracking-[0.25em] text-moss">
            Director Console
          </Link>
          <h1 className="text-4xl font-semibold text-ink">Run {runId}</h1>
          <p className="max-w-2xl text-slate-700">
            查看单个模拟运行的当前状态、tick 进度和下一步导航。
          </p>
        </header>

        <SectionCard title="Run Status" description="来自后端 `/runs/{id}` 的实时数据。">
          {run ? (
            <div className="grid gap-4 md:grid-cols-4">
              <MetricChip label="Name" value={run.name} />
              <MetricChip label="Status" value={run.status} />
              <MetricChip label="Tick" value={run.current_tick ?? "-"} />
              <MetricChip label="Tick Minutes" value={run.tick_minutes ?? "-"} />
            </div>
          ) : (
            <p className="text-sm text-slate-600">后端暂不可用，当前展示为占位状态。</p>
          )}
        </SectionCard>

        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Timeline" description="跳转到该 run 的事件时间线。">
            <Link
              href={`/runs/${runId}/timeline`}
              className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
            >
              查看 Timeline
            </Link>
          </SectionCard>

          <SectionCard title="Agent Inspector" description="输入你要检查的 agent 标识。">
            <Link
              href={`/runs/${runId}/agents/demo_agent`}
              className="inline-flex rounded-full bg-ember px-4 py-2 text-sm font-medium text-white"
            >
              打开 Demo Agent
            </Link>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

