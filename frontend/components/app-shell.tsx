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
    label: "首页",
    exact: true,
  },
];

function SidebarNavItem({
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
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
        isActive
          ? "bg-moss text-white shadow-sm"
          : "text-slate-400 hover:bg-white/60 hover:text-ink"
      }`}
    >
      {icon}
    </Link>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f0e8]">
      {/* 左侧窄导航栏 */}
      <nav className="flex w-16 flex-shrink-0 flex-col items-center gap-2 border-r border-slate-200/60 bg-white/70 py-4 backdrop-blur">
        {/* Logo */}
        <Link
          href="/"
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white shadow-sm"
          title="AI Truman World"
        >
          <span className="text-sm font-bold">TW</span>
        </Link>

        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            exact={item.exact}
          />
        ))}
      </nav>

      {/* 右侧主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
