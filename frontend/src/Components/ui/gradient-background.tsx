'use client';

import type React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GradientBackgroundProps = React.ComponentProps<"div"> & {
  gradients?: string[];
  animationDuration?: number;
  animationDelay?: number;
  enableCenterContent?: boolean;
  overlay?: boolean;
  overlayOpacity?: number;
};

const defaultGradients = [
  "linear-gradient(135deg, #F8FBFF 0%, #C8E4F8 30%, #AFCFEF 68%, #FFFFFF 100%)",
  "linear-gradient(135deg, #F4FAFF 0%, #B8D9F3 32%, #D2ECF7 72%, #FFFFFF 100%)",
  "linear-gradient(135deg, #FFFFFF 0%, #C6E2F7 34%, #9FC5E8 72%, #F8FBFF 100%)",
  "linear-gradient(135deg, #F2FAFF 0%, #D3E8FA 28%, #AFD3F0 70%, #FFFFFF 100%)",
  "linear-gradient(135deg, #F8FBFF 0%, #C8E4F8 30%, #AFCFEF 68%, #FFFFFF 100%)",
];

export function GradientBackground({
  children,
  className = "",
  gradients = defaultGradients,
  animationDuration = 10,
  animationDelay = 0.4,
  enableCenterContent = true,
  overlay = false,
  overlayOpacity = 0.3,
  ...props
}: GradientBackgroundProps) {
  return (
    <div className={cn("w-full overflow-hidden", className)} {...props}>
      <motion.div
        className="absolute inset-0"
        style={{ background: gradients[0] }}
        animate={{ background: gradients }}
        transition={{
          delay: animationDelay,
          duration: animationDuration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-white"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {children && (
        <div
          className={cn(
            "relative z-10",
            enableCenterContent && "flex min-h-full items-center justify-center",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
