import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted/55 motion-reduce:animate-none motion-reduce:opacity-70", className)}
      {...props}
    />
  )
}

export { Skeleton }
