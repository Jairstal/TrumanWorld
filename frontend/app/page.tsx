import { CreateRunForm } from "@/components/create-run-form";
import { RunList } from "@/components/run-list";
import { listRuns } from "@/lib/api";

export default async function HomePage() {
  const runs = await listRuns();
  const hasRuns = runs.length > 0;
  const runningCount = runs.filter((r) => r.status === "running").length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-white/60 bg-white/65 px-8 py-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-moss">Director Console</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">控制台</h1>
            <p className="mt-1 text-sm text-slate-500">创建 run、监控状态，并进入各个模拟世界的导演驾驶舱。</p>
          </div>
          {hasRuns && (
            <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                {runningCount} 个运行中
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,#172033,#24314a_52%,#365364)] text-white shadow-xl shadow-slate-900/10">
            <div className="flex flex-wrap items-center justify-between gap-6 p-8">
              <div className="max-w-2xl space-y-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">New Simulation</p>
                <h2 className="text-3xl font-semibold">创建一个新的模拟世界</h2>
                <p className="text-sm leading-6 text-slate-300">
                  新 run 会生成一组可观察的居民与地点。创建后即可进入世界视图、时间线和导演控制面板。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Runs</p>
                  <p className="mt-2 text-2xl font-semibold">{runs.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Running</p>
                  <p className="mt-2 text-2xl font-semibold">{runningCount}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 bg-white/5 px-8 py-6">
              <CreateRunForm />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Run Registry</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">模拟运行</h2>
                <p className="mt-1 text-sm text-slate-500">查看所有 run，并继续进入各自的总览页。</p>
              </div>
              {hasRuns && (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  共 {runs.length} 个
                </span>
              )}
            </div>
            <RunList runs={runs} />
          </section>
        </div>
      </div>
    </div>
  );
}
