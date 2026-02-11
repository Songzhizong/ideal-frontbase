import AppLogo from "@/assets/logo.svg"
import { BaseLink } from "@/packages/platform-router"
import { cn } from "@/packages/ui-utils"

interface TopbarBrandProps {
  className?: string
}

export function TopbarBrand({ className }: TopbarBrandProps) {
  const appTitle = import.meta.env.VITE_APP_TITLE ?? "Infera"

  return (
    <BaseLink
      to="/"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border border-border/50 bg-background px-3 transition-colors hover:bg-muted/50 cursor-pointer",
        className,
      )}
      aria-label={`${appTitle} 首页`}
    >
      <span className="inline-flex size-5 items-center justify-center rounded-md bg-primary">
        <img src={AppLogo} alt={`${appTitle} logo`} className="size-3 brightness-0 invert" />
      </span>
      <span className="hidden max-w-[9rem] truncate text-sm font-semibold text-foreground lg:inline">
        {appTitle}
      </span>
    </BaseLink>
  )
}
