
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors z-50",
      orientation === "vertical" &&
        "h-full w-3 border-l border-l-transparent p-[1px] bg-gradient-to-b from-pink-100/50 to-purple-100/50 dark:from-pink-900/30 dark:to-purple-900/30 backdrop-blur-sm",
      orientation === "horizontal" &&
        "h-3 flex-col border-t border-t-transparent p-[1px] bg-gradient-to-r from-pink-100/50 to-purple-100/50 dark:from-pink-900/30 dark:to-purple-900/30 backdrop-blur-sm",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-gradient-to-b from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 shadow-lg hover:from-pink-500 hover:to-purple-600 dark:hover:from-pink-400 dark:hover:to-purple-500 transition-all duration-200" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
