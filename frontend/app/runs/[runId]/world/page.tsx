import Link from "next/link";

import { WorldCanvas } from "@/components/world-canvas";
import { getWorld } from "@/lib/api";

type WorldPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function WorldPage({ params }: WorldPageProps) {
  const { runId } = await params;
  const initialData = await getWorld(runId);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#f7f3e8,_#eef5f1_48%,_#f8fafc)]">
      {/* 顶部标题栏 */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-white/40 bg-white/50 px-8 py-4 backdrop-blur">
        <div>
          <Link href={`/runs/${runId}`} className="text-xs uppercase tracking-[0.25em] text-moss hover:text-ink">
            ← {initialData?.run.name ?? "Run"}
          </Link>
          <h1 className="mt-0.5 text-xl font-semibold text-ink">World Viewer</h1>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-xs text-slate-600 shadow-sm">
          导演视角 · 实时刷新
        </div>
      </div>

      {/* 全屏地图区 */}
      <div className="min-h-0 flex-1">
        <WorldCanvas runId={runId} initialData={initialData} />
      </div>
    </div>
  );
}
