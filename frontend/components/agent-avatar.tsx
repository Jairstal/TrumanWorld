"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";
import { motion } from "framer-motion";

import type { AgentStatus } from "@/lib/agent-utils";

// Re-export for convenience
export type { AgentStatus } from "@/lib/agent-utils";

interface AgentAvatarProps {
  agentId: string;
  name: string;
  occupation?: string;
  status?: AgentStatus;
  size?: "sm" | "md" | "lg";
  showStatusRing?: boolean;
}

const sizeMap = {
  sm: { container: 32, svg: 28 },
  md: { container: 48, svg: 42 },
  lg: { container: 64, svg: 56 },
};

const statusConfig: Record<AgentStatus, { color: string; pulse: boolean; label: string }> = {
  idle: { color: "#94a3b8", pulse: false, label: "空闲" },
  working: { color: "#f59e0b", pulse: true, label: "工作中" },
  talking: { color: "#ec4899", pulse: true, label: "交谈中" },
  moving: { color: "#10b981", pulse: true, label: "移动中" },
  resting: { color: "#6366f1", pulse: false, label: "休息中" },
};

export function AgentAvatar({
  agentId,
  name,
  occupation,
  status = "idle",
  size = "md",
  showStatusRing = true,
}: AgentAvatarProps) {
  const dimensions = sizeMap[size];
  
  // 使用 agentId 作为种子生成确定性头像
  const avatarSvg = useMemo(() => {
    const avatar = createAvatar(notionists, {
      seed: agentId,
      size: dimensions.svg,
      backgroundColor: ["c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
      radius: 50,
    });
    return avatar.toString();
  }, [agentId, dimensions.svg]);

  const statusStyle = statusConfig[status];

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: dimensions.container, height: dimensions.container }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* 状态脉冲环 */}
      {showStatusRing && statusStyle.pulse && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: statusStyle.color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* 状态边框 */}
      {showStatusRing && (
        <span
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: statusStyle.color }}
        />
      )}
      
      {/* 头像 */}
      <div
        className="relative overflow-hidden rounded-full bg-white shadow-sm"
        style={{
          width: dimensions.container - 4,
          height: dimensions.container - 4,
        }}
        dangerouslySetInnerHTML={{ __html: avatarSvg }}
      />
      
      {/* 职业小图标 */}
      {occupation && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] shadow-sm"
          title={occupation}
        >
          {getOccupationEmoji(occupation)}
        </span>
      )}
    </motion.div>
  );
}

function getOccupationEmoji(occupation: string): string {
  const map: Record<string, string> = {
    barista: "☕",
    shopkeeper: "🏪",
    resident: "🏠",
    teacher: "📚",
    artist: "🎨",
    chef: "👨‍🍳",
    farmer: "🌾",
    doctor: "👨‍⚕️",
  };
  return map[occupation.toLowerCase()] || "👤";
}
