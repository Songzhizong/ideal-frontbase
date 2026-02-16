import { cn } from "@/packages/ui-utils"

interface ThemeVariableItem {
  name: string
  description: string
  colors: readonly string[]
}

const THEME_VARIABLES: ThemeVariableItem[] = [
  {
    name: "--primary",
    description: "Default 变体背景色",
    colors: ["bg-primary", "bg-primary-foreground"],
  },
  {
    name: "--secondary",
    description: "Secondary 变体背景色",
    colors: ["bg-secondary", "bg-secondary-foreground"],
  },
  {
    name: "--destructive",
    description: "Destructive 变体背景色",
    colors: ["bg-destructive", "bg-destructive-foreground"],
  },
  {
    name: "--accent",
    description: "Ghost/Outline 悬停背景色",
    colors: ["bg-accent", "bg-accent-foreground"],
  },
  {
    name: "--muted",
    description: "禁用态背景/次要文本",
    colors: ["bg-muted", "bg-muted-foreground"],
  },
  {
    name: "--ring",
    description: "Focus 聚焦环颜色",
    colors: ["bg-ring"],
  },
]

export function ButtonMdThemeVariablesDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {THEME_VARIABLES.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-3 rounded-lg border border-border p-3"
        >
          <div className="flex shrink-0 -space-x-1.5 overflow-hidden">
            {item.colors.map((colorClassName) => (
              <div
                key={`${item.name}-${colorClassName}`}
                className={cn("size-6 rounded-full ring-2 ring-background", colorClassName)}
              />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-code text-xs font-semibold text-foreground">{item.name}</p>
            <p className="truncate text-xs text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ButtonMdThemeVariablesDemo
