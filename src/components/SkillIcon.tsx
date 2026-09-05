"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";

interface SkillIconProps {
  icon: IconType;
  name: string;
  color?: string;
}

export default function SkillIcon({ icon: Icon, name, color }: SkillIconProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-hover transition-colors skill-icon-glow cursor-default group"
    >
      <Icon
        size={32}
        style={color ? { color } : undefined}
        className={`transition-transform ${!color ? "text-muted group-hover:text-foreground" : ""}`}
      />
      <span className="text-xs text-muted group-hover:text-foreground transition-colors font-medium">
        {name}
      </span>
    </motion.div>
  );
}
