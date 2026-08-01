import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-800 text-slate-300 border-white/8",
        blue: "bg-blue-600/10 text-blue-500 border-blue-600/20",
        violet: "bg-violet-600/10 text-violet-500 border-violet-600/20",
        amber: "bg-amber-600/10 text-amber-600 border-amber-600/20",
        rose: "bg-rose-600/10 text-rose-500 border-rose-600/20",
        emerald: "bg-emerald-600/10 text-emerald-500 border-emerald-600/20",
        cyan: "bg-cyan-600/10 text-cyan-500 border-cyan-600/20",
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
