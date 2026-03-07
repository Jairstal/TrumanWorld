"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { restoreAllRuns } from "@/lib/api";

type RestoreBannerProps = {
  count: number;
};

export function RestoreBanner({ count }: RestoreBannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRestoring, setIsRestoring] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || count === 0) {
    return null;
  }

  const handleRestore = () => {
    setIsRestoring(true);
    startTransition(async () => {
      const result = await restoreAllRuns();
      setIsRestoring(false);
      if (result.length > 0) {
        router.refresh();
      } else {
        alert("恢复失败，请重试。");
      }
    });
  };

  return (
    <div className="rounded-[28px] border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-600"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              服务重启检测
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              发现 {count} 个运行在重启前正在运行，现已暂停。点击右侧按钮一键恢复。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            disabled={isPending || isRestoring}
            className="rounded-xl px-3 py-2 text-xs font-medium text-amber-600 transition hover:bg-amber-100 disabled:opacity-50"
          >
            忽略
          </button>
          <button
            type="button"
            onClick={handleRestore}
            disabled={isPending || isRestoring}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            {isRestoring ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                恢复中...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                恢复全部
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
