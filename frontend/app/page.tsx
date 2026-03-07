import { CreateRunForm } from "@/components/create-run-form";
import { RunList } from "@/components/run-list";
import { listRuns } from "@/lib/api";

export default async function HomePage() {
  const runs = await listRuns();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="flex-shrink-0 border-b border-slate-200/60 bg-white/60 px-8 py-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-moss">导演控制台</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">AI Truman World</h1>
      </div>

      {/* 内容区：左侧创建表单 + 右侧运行列表 */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 左侧：创建表单（固定宽度） */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200/60 bg-white/40 p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">创建新运行</h2>
            <p className="mt-1 text-xs text-slate-500">创建新的模拟世界，启动居民和故事。</p>
          </div>
          <CreateRunForm />
        </div>

        {/* 右侧：运行列表（占满剩余，可滚动） */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-shrink-0 border-b border-slate-200/40 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">模拟运行</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                {runs.length} 个
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <RunList runs={runs} />
          </div>
        </div>
      </div>
    </div>
  );
}
