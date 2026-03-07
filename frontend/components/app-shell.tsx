"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* 可折叠侧边栏 */}
      <nav
        className={`flex flex-shrink-0 flex-col border-r border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,249,252,0.72))] backdrop-blur-xl transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-[272px]"
        }`}
      >
        {/* Logo 区域 */}
        <div className="border-b border-white/60 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#172033,#34425f)] text-white shadow-md shadow-slate-900/10">
              <span className="text-sm font-bold tracking-[0.08em]">TW</span>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-base font-semibold text-ink">Truman World</h1>
                <p className="text-[11px] text-slate-400">导演控制台</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-4 rounded-[24px] border border-slate-200 bg-white/70 p-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-moss">Studio</p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                管理模拟世界、观察居民行为，并在关键节点进行导演干预。
              </p>
            </div>
          )}
        </div>

        {/* 折叠按钮 */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mx-3 mt-3 flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 py-2 text-slate-500 transition hover:bg-white hover:text-ink"
          title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {!isCollapsed && <span className="ml-2 text-xs">收起</span>}
        </button>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-2">
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
                主要
              </p>
            )}
            {NAV_ITEMS.map((item) => (
              <SidebarNavItemWide
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                exact={item.exact}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-white/60 p-3">
          {!isCollapsed ? (
            <div className="rounded-[24px] border border-slate-200 bg-white/70 p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">版本</p>
              <p className="mt-1 text-sm font-medium text-slate-700">v0.1.0 MVP</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">当前重点是 run 总览、世界视图和导播操作链路。</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="text-[10px] text-slate-400">v0.1</span>
            </div>
          )}
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
  isCollapsed = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={label}
      className={`flex items-center transition-all ${
        isCollapsed
          ? "justify-center rounded-xl px-2 py-2"
          : "gap-3 rounded-2xl px-3 py-3"
      } ${
        isActive
          ? "bg-[linear-gradient(135deg,rgba(111,139,107,0.14),rgba(111,139,107,0.06))] text-moss shadow-sm"
          : "text-slate-600 hover:bg-white/70 hover:text-ink"
      }`}
    >
      <span className={isActive ? "text-moss" : "text-slate-400"}>{icon}</span>
      {!isCollapsed && <span className={isActive ? "font-medium" : ""}>{label}</span>}
    </Link>
  );
}
