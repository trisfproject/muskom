import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-40 shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 hover:-translate-y-px",
        secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-white/8 hover:-translate-y-px",
        ghost: "text-slate-400 hover:text-white hover:bg-white/6",
        outline: "border border-white/12 text-white/80 hover:text-white hover:border-white/25 hover:bg-white/5",
        danger: "bg-red-500/12 text-red-400 hover:bg-red-500/20 border border-red-500/20",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        md: "h-10 px-5",
        lg: "h-12 px-7 text-base",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </>
        ) : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
