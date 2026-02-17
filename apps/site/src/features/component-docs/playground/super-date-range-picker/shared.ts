import type { QuickPresetItem } from "@/packages/ui"

export const superDateRangeQuickPresets: QuickPresetItem[] = [
  {
    key: "last-15m",
    label: "最近 15 分钟",
    group: "相对时间",
    keywords: ["15m", "recent"],
    definition: {
      from: { expr: "now-15m" },
      to: { expr: "now" },
      label: "最近 15 分钟",
      ui: { editorMode: "relative" },
    },
  },
  {
    key: "last-1h",
    label: "最近 1 小时",
    group: "相对时间",
    keywords: ["1h", "recent"],
    definition: {
      from: { expr: "now-1h" },
      to: { expr: "now" },
      label: "最近 1 小时",
      ui: { editorMode: "relative" },
    },
  },
  {
    key: "today",
    label: "今天",
    group: "绝对时间",
    keywords: ["today"],
    definition: {
      from: { expr: "now/d" },
      to: { expr: "now" },
      label: "今天",
      ui: { editorMode: "mixed" },
    },
  },
]
