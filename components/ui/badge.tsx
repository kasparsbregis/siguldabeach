import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary/20 text-secondary-foreground",
        outline: "text-foreground border-white/15 bg-white/[0.04]",
        gold: "border-amber-500/20 bg-amber-500/15 text-amber-300",
        silver: "border-slate-400/20 bg-slate-400/10 text-slate-300",
        bronze: "border-orange-500/20 bg-orange-500/15 text-orange-300",
        ocean: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
