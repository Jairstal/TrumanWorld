"use client";

import { useState, useTransition } from "react";

import { useDemoAccess } from "@/components/demo-access-provider";

export function DemoAccessControl() {
  const { ready, writeProtected, adminAuthorized, unlock, lock } = useDemoAccess();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!ready) {
    return (
      <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-400">
        权限检查中
      </div>
    );
  }

  if (!writeProtected) {
    return (
      <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        可编辑模式
      </div>
    );
  }

  if (adminAuthorized) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          Admin Unlocked
        </span>
        <button
          type="button"
          onClick={lock}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          锁定
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");
        startTransition(async () => {
          const result = await unlock(password);
          if (result.ok) {
            setPassword("");
            return;
          }
          setMessage(result.error ?? "解锁失败");
        });
      }}
    >
      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
        Demo / Read Only
      </span>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="管理员密码"
        className="w-32 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-hidden transition focus:border-moss focus:ring-2 focus:ring-moss/20"
      />
      <button
        type="submit"
        disabled={isPending || password.trim().length === 0}
        className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        解锁控制
      </button>
      {message ? <span className="text-xs text-red-600">{message}</span> : null}
    </form>
  );
}
