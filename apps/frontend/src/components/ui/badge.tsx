import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-800 text-slate-300 border-white/8",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
