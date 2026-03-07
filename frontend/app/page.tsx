import { NavLink } from "@/components/nav-link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-moss">Director Console</p>
          <h1 className="text-5xl font-semibold">AI Truman World</h1>
          <p className="max-w-2xl text-lg text-slate-700">
            导演控制台已经接入真实 API 页面结构。你可以从这里进入 run、timeline 和 agent
            检视流程。
          </p>
        </header>
        <section className="grid gap-4 md:grid-cols-3">
          <NavLink href="/runs/00000000-0000-0000-0000-000000000001" eyebrow="Runs" title="Run Detail">
            查看单个运行的状态、tick 和控制入口。
          </NavLink>
          <NavLink
            href="/runs/00000000-0000-0000-0000-000000000001/timeline"
            eyebrow="Timeline"
            title="Timeline"
          >
            追踪事件流与导演注入事件。
          </NavLink>
          <NavLink
            href="/runs/00000000-0000-0000-0000-000000000001/agents/demo_agent"
            eyebrow="Agents"
            title="Agent Inspector"
          >
            检查单个 agent 的状态、记忆和关系。
          </NavLink>
        </section>
      </div>
    </main>
  );
}
