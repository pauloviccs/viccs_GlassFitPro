import * as React from "react"

import { cn } from "@/lib/utils"

const GlassCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        variant?: "default" | "strong" | "subtle"
        glow?: boolean
    }
>(({ className, variant = "default", glow = false, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border text-card-foreground shadow-sm",
                {
                    "glass": variant === "default",
                    "glass-strong": variant === "strong",
                    "glass-subtle": variant === "subtle",
                    "glass-glow": glow,
                },
                className
            )}
            {...props}
        />
    )
})
GlassCard.displayName = "GlassCard"

export { GlassCard }
