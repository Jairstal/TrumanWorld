import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { getTimeline } from "@/lib/api";

type TimelinePageProps = {
  params: Promise<{ runId: string }>;
};

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { runId } = await params;
  const timeline = await getTimeline(runId);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <Link href={`/runs/${runId}`} className="text-sm uppercase tracking-[0.25em] text-moss">
            Run Detail
          </Link>
          <h1 className="text-4xl font-semibold text-ink">Timeline</h1>
          <p className="max-w-2xl text-slate-700">按 tick 查看该运行中已经写入数据库的结构化事件。</p>
        </header>

        <SectionCard
          title="Events"
          description="如果后端当前没有数据，这里会保持为空而不是让页面报错。"
        >
          <div className="space-y-3">
            {timeline.events.length === 0 ? (
              <p className="text-sm text-slate-600">暂无事件。</p>
            ) : (
              timeline.events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200 bg-mist px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-ink">{event.event_type}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-moss">
                      Tick {event.tick_no}
                    </span>
                  </div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

