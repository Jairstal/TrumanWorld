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
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_#f7f3e8,_#eef5f1_48%,_#f8fafc)]">
      <div className="flex min-h-screen flex-col px-4 pb-4 pt-6 md:px-6">
        <header className="mb-4 space-y-3">
          <Link href={`/runs/${runId}`} className="text-sm uppercase tracking-[0.25em] text-moss">
            Director Console
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-ink md:text-5xl">
                {initialData ? initialData.run.name : "World Viewer"}
              </h1>
              <p className="max-w-4xl text-slate-600">
                小镇实况。地点、人物分布与最近的故事节拍会自动刷新，并在同一屏内联动展示。
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm">
              全屏导演视角
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1">
          <WorldCanvas runId={runId} initialData={initialData} />
        </div>
      </div>
    </main>
  );
}
