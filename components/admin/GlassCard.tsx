import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-card text-card-foreground border border-border/50 shadow-sm backdrop-blur-sm rounded-2xl", className)}
      {...props}
    />
  );
}
