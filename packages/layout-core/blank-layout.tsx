import type * as React from "react"
import { useThemeStore } from "@/packages/theme-system"
import { cn } from "@/packages/ui-utils"

interface BlankLayoutProps {
  children: React.ReactNode
}

/**
 * Blank Layout Component
 * Minimal layout for unauthenticated pages (login, register, etc.)
 * Provides basic theming support without navigation elements
 */
export function BlankLayout({ children }: BlankLayoutProps) {
  const pageAnimation = useThemeStore((state) => state.ui.pageAnimation)

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <main className="flex min-h-screen flex-col">
        <div
          className={cn(
            "flex-1 w-full h-full",
            pageAnimation !== "none" && `animate-${pageAnimation}`,
          )}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
