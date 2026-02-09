import { Columns2, Layout } from "lucide-react"
import type * as React from "react"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { cn } from "@/packages/ui-utils"
import darkThemeImg from "../../assets/theme-styles/dark.png"
import lightThemeImg from "../../assets/theme-styles/light.png"
import systemThemeImg from "../../assets/theme-styles/system.png"
import type { ThemeStore } from "../../hooks/use-theme-store"
import { themePresets } from "../../theme-presets"
import type { ThemeConfig } from "../../types/theme"

type ThemeMode = ThemeConfig["mode"]

export type ThemeModeImages = Record<ThemeMode, string>

const defaultThemeModeImages: ThemeModeImages = {
  light: lightThemeImg,
  dark: darkThemeImg,
  system: systemThemeImg,
}

export interface ThemeSettingsContentProps {
  store: ThemeStore
  modeImages?: Partial<ThemeModeImages>
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

const themeModes: ReadonlyArray<{
  id: ThemeMode
  label: string
}> = [
  { id: "light", label: "浅色" },
  { id: "dark", label: "深色" },
  { id: "system", label: "系统" },
]

const menuLayouts: ReadonlyArray<{
  id: ThemeConfig["layout"]["menuLayout"]
  label: string
  icon: typeof Layout
}> = [
  { id: "single", label: "垂直单列", icon: Layout },
  { id: "dual", label: "垂直双列", icon: Columns2 },
]

const pageAnimations: ReadonlyArray<{
  value: ThemeConfig["ui"]["pageAnimation"]
  label: string
}> = [
  { value: "none", label: "无动画" },
  { value: "fade", label: "淡入淡出" },
  { value: "slide-left", label: "左侧划入" },
  { value: "slide-bottom", label: "下方划入" },
  { value: "slide-top", label: "上方划入" },
]

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </section>
  )
}

function SwitchSetting({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm font-normal text-muted-foreground">{label}</Label>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary peer-focus:outline-none" />
      </label>
    </div>
  )
}

function SliderSetting({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Label className="text-sm font-normal text-muted-foreground">{label}</Label>
        <span className="text-xs text-muted-foreground">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
      />
    </div>
  )
}

export function ThemeSettingsContent({ store, modeImages }: ThemeSettingsContentProps) {
  const resolvedThemeModeImages: ThemeModeImages = {
    ...defaultThemeModeImages,
    ...modeImages,
  }

  return (
    <div className="flex-1 space-y-8 overflow-y-auto p-6">
      <Section title="主题风格">
        <div className="grid grid-cols-3 gap-4">
          {themeModes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => store.setMode(item.id)}
              className="group flex flex-col items-center gap-2 focus:outline-none focus-visible:outline-none"
            >
              <div
                className={cn(
                  "relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border-2 transition-all",
                  store.mode === item.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted hover:bg-muted/80",
                )}
              >
                <img
                  src={resolvedThemeModeImages[item.id]}
                  alt={item.label}
                  className="h-full w-full object-cover"
                />
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  store.mode === item.id
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="菜单布局">
        <div className="grid grid-cols-2 gap-4">
          {menuLayouts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => store.setMenuLayout(item.id)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
                store.layout.menuLayout === item.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent bg-muted hover:bg-muted/80",
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="系统主题色">
        <div className="flex flex-wrap justify-center gap-3">
          {themePresets.map((preset) => {
            const primaryColor = preset.schemes.light.brand.primary.default

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => store.setPreset(preset.key)}
                className={cn(
                  "group relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all hover:scale-110",
                  store.activePreset === preset.key
                    ? "border-border ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "border-transparent",
                )}
                title={preset.name}
              >
                <div
                  className="h-full w-full rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="界面展示">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-normal text-muted-foreground">容器宽度</Label>
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => store.setContainerWidth("full")}
              className={cn(
                "rounded-md px-3 py-1 text-xs transition-all",
                store.layout.containerWidth === "full"
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              铺满
            </button>
            <button
              type="button"
              onClick={() => store.setContainerWidth("fixed")}
              className={cn(
                "rounded-md px-3 py-1 text-xs transition-all",
                store.layout.containerWidth === "fixed"
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              固定
            </button>
          </div>
        </div>
      </Section>

      <Section title="侧边栏设置">
        <div className="space-y-4">
          <SliderSetting
            label="侧边栏宽度"
            value={store.layout.sidebarWidth}
            min={160}
            max={320}
            onChange={store.setSidebarWidth}
          />
          <SliderSetting
            label="折叠宽度"
            value={store.layout.sidebarCollapsedWidth}
            min={48}
            max={96}
            onChange={store.setSidebarCollapsedWidth}
          />
        </div>
      </Section>

      <Section title="头部设置">
        <div className="space-y-5">
          <SliderSetting
            label="头部高度"
            value={store.layout.headerHeight}
            min={48}
            max={80}
            onChange={store.setHeaderHeight}
          />
          <SwitchSetting
            label="显示面包屑"
            checked={store.ui.showBreadcrumb}
            onChange={store.setShowBreadcrumb}
          />
          <SwitchSetting
            label="显示面包屑图标"
            checked={store.ui.showBreadcrumbIcon}
            onChange={store.setShowBreadcrumbIcon}
          />
        </div>
      </Section>

      <Section title="基础配置">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-normal text-muted-foreground">页面切换动画</Label>
            <Select
              value={store.ui.pageAnimation}
              onValueChange={(value) => {
                store.setPageAnimation(value as ThemeConfig["ui"]["pageAnimation"])
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择动画" />
              </SelectTrigger>
              <SelectContent>
                {pageAnimations.map((animation) => (
                  <SelectItem key={animation.value} value={animation.value}>
                    {animation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SliderSetting
            label="自定义圆角"
            value={store.ui.borderRadius}
            min={0}
            max={32}
            onChange={store.setBorderRadius}
          />
        </div>
      </Section>
    </div>
  )
}
