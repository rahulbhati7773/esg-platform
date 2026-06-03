import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn.js";

type PanelCardProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export function PanelCard({
  children,
  className,
  interactive = false,
}: PanelCardProps) {
  const Component = interactive ? motion.div : "div";
  const motionProps = interactive
    ? {
        whileHover: { y: -2, transition: { duration: 0.2 } },
      }
    : {};

  return (
    <Component
      {...motionProps}
      className={cn("surface-card p-5", className)}
    >
      {children}
    </Component>
  );
}
