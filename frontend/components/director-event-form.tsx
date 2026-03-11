"use client";

import { useState, useTransition } from "react";

import { injectDirectorEventResult } from "@/lib/api";

type DirectorEventFormProps = {
  runId: string;
  onInjected?: () => void;
  compact?: boolean;
  locations?: Array<{ id: string; name: string; location_type: string }>;
};

const EVENT_OPTIONS = [
  { value: "broadcast", label: "广播", needsLocation: false, placeholder: "输入要广播给居民的消息..." },
  { value: "activity", label: "活动", needsLocation: true, placeholder: "输入活动内容..." },
  { value: "shutdown", label: "地点关闭", needsLocation: true, placeholder: "输入关闭说明..." },
  { value: "weather_change", label: "天气变化", needsLocation: false, placeholder: "输入天气变化说明..." },
  { value: "power_outage", label: "停电", needsLocation: true, placeholder: "输入停电影响说明..." },
] as const;

const PRESET_MESSAGES: Record<string, string[]> = {
  broadcast: ["广场集合", "停电通知", "市集营业", "电影放映"],
  activity: ["广场演出", "咖啡馆活动", "海边集市"],
  shutdown: ["医院临时关闭", "码头暂停开放", "广场维护中"],
  weather_change: ["突发大雨", "海风增强", "傍晚降温"],
  power_outage: ["广场停电", "咖啡馆停电", "街区停电"],
};

export function DirectorEventForm({
  runId,
  onInjected,
  compact,
  locations = [],
}: DirectorEventFormProps) {
  const [eventType, setEventType] = useState<(typeof EVENT_OPTIONS)[number]["value"]>("broadcast");
  const [message, setMessage] = useState("Town hall at plaza");
  const [locationId, setLocationId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const eventOption = EVENT_OPTIONS.find((item) => item.value === eventType) ?? EVENT_OPTIONS[0];
  const presets = PRESET_MESSAGES[eventType] ?? PRESET_MESSAGES.broadcast;
  const isSubmitDisabled = isPending || (eventOption.needsLocation && !locationId);

  return (
    <form
      className={compact ? "space-y-3" : "space-y-5"}
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await injectDirectorEventResult(runId, {
            event_type: eventType,
            payload: { message },
            location_id: locationId || undefined,
            importance: 0.8,
          });
          setStatusMessage(
            result.data
              ? "已注入"
              : result.error === "network_error"
                ? "后端不可达"
                : "注入失败",
          );
          if (result.data) {
            onInjected?.();
          }
          setTimeout(() => setStatusMessage(""), 3000);
        });
      }}
    >
      {/* 标题 + 预设 */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-ink">导演干预</span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
              {eventOption.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMessage(preset)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-moss hover:bg-moss/5 hover:text-moss"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 表单字段 */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-600">事件类型</span>
        </label>
        <select
          value={eventType}
          onChange={(event) => {
            const nextType = event.target.value as (typeof EVENT_OPTIONS)[number]["value"];
            setEventType(nextType);
            setMessage(PRESET_MESSAGES[nextType]?.[0] ?? "");
            if (nextType === "broadcast" || nextType === "weather_change") {
              setLocationId("");
            }
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-hidden transition hover:border-slate-300 focus:border-moss focus:ring-2 focus:ring-moss/10"
        >
          {EVENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {eventOption.needsLocation && (
          <>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">影响地点</span>
            </label>
            <select
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-hidden transition hover:border-slate-300 focus:border-moss focus:ring-2 focus:ring-moss/10"
            >
              <option value="">选择地点</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </>
        )}
        {!compact && (
          <label className="block">
            <span className="text-sm font-medium text-slate-600">事件内容</span>
          </label>
        )}
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={compact ? 2 : 4}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed outline-hidden transition placeholder:text-slate-400 hover:border-slate-300 focus:border-moss focus:ring-2 focus:ring-moss/10"
          placeholder={eventOption.placeholder}
        />
      </div>

      {/* 预设按钮（紧凑模式） */}
      {compact && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setMessage(preset)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 transition hover:border-moss hover:bg-moss/5 hover:text-moss"
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* 提交 + 状态 */}
      <div className={`flex items-center gap-3 ${compact ? "" : "pt-2"}`}>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`rounded-full bg-ember font-medium text-white shadow-xs transition hover:bg-ember/90 hover:shadow-sm disabled:opacity-60 ${compact ? "px-4 py-1.5 text-xs" : "px-6 py-2.5 text-sm"}`}
        >
          {isPending ? "注入中..." : "注入事件"}
        </button>
        {statusMessage && (
          <span className={`text-xs font-medium ${statusMessage === "已注入" ? "text-emerald-600" : "text-red-500"}`}>
            {statusMessage === "已注入" ? "✓ " : "✗ "}{statusMessage}
          </span>
        )}
      </div>
    </form>
  );
}
