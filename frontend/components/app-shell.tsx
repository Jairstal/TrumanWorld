"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const NAV_ITEMS = [
  {
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-6H9v6H3.75A.75.75 0 013 21V9.75z" />
      </svg>
    ),
    label: "控制台",
    exact: true,
  },
];



export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <nav className="flex w-[272px] flex-shrink-0 flex-col border-r border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,249,252,0.72))] backdrop-blur-xl">
        <div className="border-b border-white/60 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#172033,#34425f)] text-white shadow-md shadow-slate-900/10">
              <span className="text-sm font-bold tracking-[0.08em]">TW</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-ink">Truman World</h1>
              <p className="text-[11px] text-slate-400">导演控制台</p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-white/70 p-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.22em] text-moss">Studio</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              管理模拟世界、观察居民行为，并在关键节点进行导演干预。
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-5">
          <div className="px-3">
            <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
              主要
            </p>
            {NAV_ITEMS.map((item) => (
              <SidebarNavItemWide
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                exact={item.exact}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-white/60 p-4">
          <div className="rounded-[24px] border border-slate-200 bg-white/70 p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">版本</p>
            <p className="mt-1 text-sm font-medium text-slate-700">v0.1.0 MVP</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">当前重点是 run 总览、世界视图和导播操作链路。</p>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}

// 宽版导航项组件
function SidebarNavItemWide({
  href,
  icon,
  label,
  exact = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all ${
        isActive
          ? "bg-[linear-gradient(135deg,rgba(111,139,107,0.14),rgba(111,139,107,0.06))] text-moss shadow-sm"
          : "text-slate-600 hover:bg-white/70 hover:text-ink"
      }`}
    >
      <span className={isActive ? "text-moss" : "text-slate-400"}>{icon}</span>
      <span className={isActive ? "font-medium" : ""}>{label}</span>
    </Link>
  );
}
