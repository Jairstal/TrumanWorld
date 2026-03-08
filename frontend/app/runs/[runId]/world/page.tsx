import Link from "next/link";

import { WorldCanvas } from "@/components/world-canvas";
import { WorldProvider } from "@/components/world-context";
import { WorldStatusBar } from "@/components/world-status-bar";
import { getWorld } from "@/lib/api";

type WorldPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function WorldPage({ params }: WorldPageProps) {
  const { runId } = await params;
  const initialData = await getWorld(runId);

  return (
    <WorldProvider runId={runId} initialData={initialData}>
      <div className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#f7f3e8,_#eef5f1_48%,_#f8fafc)]">
        {/* 头部：标题 + 状态栏 */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/40 bg-white/55 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-6">
            <div>
              <Link href={`/runs/${runId}`} className="group flex items-center gap-1.5 text-sm text-slate-500 hover:text-moss">
                <svg className="h-4 w-4 transition group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                <span>{initialData?.run.name ?? "Run"}</span>
              </Link>
              <div className="mt-0.5 flex items-baseline gap-3">
                <h1 className="text-xl font-semibold text-ink">World Viewer</h1>
                <span className="text-sm text-slate-500">地图与实时事件</span>
              </div>
            </div>
          </div>
          <WorldStatusBar />
        </div>

        {/* 全屏地图区 */}
        <div className="min-h-0 flex-1 p-4">
          <WorldCanvas runId={runId} />
        </div>
      </div>
    </WorldProvider>
  );
}
