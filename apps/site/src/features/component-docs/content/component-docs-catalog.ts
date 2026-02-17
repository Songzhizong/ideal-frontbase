import type { ComponentDoc } from "@/features/component-docs/data/types"

type ComponentCategory =
  | "基础组件"
  | "表单与输入"
  | "导航与流程"
  | "反馈与浮层"
  | "数据展示"
  | "交互与布局"
  | "未分类"

export const UI_EXPORT_COMPONENT_SLUGS = [
  "accordion",
  "alert",
  "alert-dialog",
  "anchor",
  "app-sheet",
  "aspect-ratio",
  "avatar",
  "back-top",
  "tag",
  "breadcrumb",
  "button",
  "button-group",
  "calendar",
  "card",
  "carousel",
  "cascader",
  "chart",
  "checkbox",
  "collapsible",
  "color-picker",
  "combobox",
  "command",
  "context-menu",
  "copy-button",
  "date-picker-rac",
  "description-list",
  "dialog",
  "direction",
  "drawer",
  "dropdown-menu",
  "empty",
  "field",
  "form",
  "hover-card",
  "image",
  "input",
  "input-group",
  "input-otp",
  "item",
  "kbd",
  "label",
  "mentions",
  "menubar",
  "native-select",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "qr-code",
  "radio-group",
  "rate",
  "resizable",
  "result",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "skeleton-presets",
  "slider",
  "sonner",
  "spinner",
  "stat-card",
  "statistic",
  "status-badge",
  "steps",
  "super-date-range-picker",
  "switch",
  "table",
  "tabs",
  "tag-input",
  "textarea",
  "timeline",
  "toggle",
  "toggle-group",
  "tooltip",
  "tour",
  "transfer",
  "tree",
  "tree-select",
  "upload",
  "watermark",
  "wizard",
] as const

export type ComponentSlug = (typeof UI_EXPORT_COMPONENT_SLUGS)[number]

interface ComponentDocCatalogGroup {
  category: ComponentCategory
  slugs: readonly ComponentSlug[]
}

const COMPONENT_DOC_GROUPS: readonly ComponentDocCatalogGroup[] = [
  {
    category: "基础组件",
    slugs: [
      "button",
      "button-group",
      "tag",
      "avatar",
      "card",
      "image",
      "separator",
      "label",
      "kbd",
      "item",
      "direction",
      "aspect-ratio",
      "spinner",
      "skeleton",
      "skeleton-presets",
    ],
  },
  {
    category: "表单与输入",
    slugs: [
      "input",
      "textarea",
      "input-group",
      "input-otp",
      "checkbox",
      "radio-group",
      "switch",
      "slider",
      "select",
      "native-select",
      "combobox",
      "mentions",
      "rate",
      "tag-input",
      "field",
      "form",
      "calendar",
      "date-picker-rac",
      "super-date-range-picker",
      "cascader",
      "tree-select",
      "transfer",
      "color-picker",
      "upload",
    ],
  },
  {
    category: "导航与流程",
    slugs: [
      "breadcrumb",
      "navigation-menu",
      "menubar",
      "dropdown-menu",
      "context-menu",
      "pagination",
      "tabs",
      "anchor",
      "back-top",
      "steps",
      "wizard",
      "sidebar",
    ],
  },
  {
    category: "反馈与浮层",
    slugs: [
      "alert",
      "alert-dialog",
      "dialog",
      "drawer",
      "sheet",
      "app-sheet",
      "popover",
      "hover-card",
      "tooltip",
      "sonner",
      "progress",
      "result",
      "empty",
      "tour",
    ],
  },
  {
    category: "数据展示",
    slugs: [
      "table",
      "chart",
      "description-list",
      "stat-card",
      "statistic",
      "status-badge",
      "timeline",
      "tree",
      "carousel",
      "qr-code",
      "watermark",
    ],
  },
  {
    category: "交互与布局",
    slugs: [
      "accordion",
      "collapsible",
      "scroll-area",
      "resizable",
      "toggle",
      "toggle-group",
      "command",
      "copy-button",
    ],
  },
] as const

const BETA_COMPONENT_SLUGS = new Set<string>([
  "table",
  "tree",
  "tree-select",
  "transfer",
  "wizard",
  "tour",
  "super-date-range-picker",
  "cascader",
  "color-picker",
  "timeline",
  "upload",
  "mentions",
])

const UPPERCASE_PART_MAP: Readonly<Record<string, string>> = {
  kbd: "KBD",
  otp: "OTP",
  qr: "QR",
  rac: "RAC",
}

function toComponentName(slug: ComponentSlug) {
  return slug
    .split("-")
    .map((part) => UPPERCASE_PART_MAP[part] ?? `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function toComponentStatus(slug: ComponentSlug): ComponentDoc["status"] {
  return BETA_COMPONENT_SLUGS.has(slug) ? "beta" : "stable"
}

function buildDefaultComponentDoc(slug: ComponentSlug, category: ComponentCategory): ComponentDoc {
  const name = toComponentName(slug)

  return {
    slug,
    name,
    category,
    status: toComponentStatus(slug),
    since: "0.1.0",
    summary: `${name} 组件文档正在建设中，当前页面为默认占位版本。`,
    usage: `建议先结合源码使用，后续会补齐 ${name} 的完整 API、示例与最佳实践。`,
    docsPath: `packages/ui/${slug}.tsx`,
    scenarios: ["基础渲染", "业务页面集成", "与其他组件组合"],
    notes: [
      "当前为默认文档模板，内容会在后续迭代中完善。",
      "优先关注组件的语义化用法，避免在业务层重复封装基础逻辑。",
      "复杂交互场景建议先在独立页面验证，再沉淀为稳定范式。",
    ],
    api: [
      {
        name: "待补充",
        type: "-",
        defaultValue: "-",
        description: "该组件 API 将在后续文档迭代中补充。",
      },
    ],
  }
}

function toDeduplicatedSlugs(slugs: readonly ComponentSlug[]) {
  return Array.from(new Set(slugs))
}

function buildCatalogEntries() {
  const entries: Array<{
    slug: ComponentSlug
    category: ComponentCategory
  }> = []
  const seen = new Set<ComponentSlug>()
  const duplicatedSlugs: ComponentSlug[] = []

  COMPONENT_DOC_GROUPS.forEach((group) => {
    group.slugs.forEach((slug) => {
      if (seen.has(slug)) {
        duplicatedSlugs.push(slug)
        return
      }

      seen.add(slug)
      entries.push({ slug, category: group.category })
    })
  })

  const missingSlugs = UI_EXPORT_COMPONENT_SLUGS.filter((slug) => !seen.has(slug))
  missingSlugs.forEach((slug) => {
    entries.push({ slug, category: "未分类" })
  })

  if (duplicatedSlugs.length > 0 || missingSlugs.length > 0) {
    const duplicatedText =
      duplicatedSlugs.length > 0 ? toDeduplicatedSlugs(duplicatedSlugs).join(", ") : "无"
    const missingText = missingSlugs.length > 0 ? missingSlugs.join(", ") : "无"

    console.error(
      `[component-docs-catalog] 检测到目录配置问题，已自动修复：重复=${duplicatedText}；缺失=${missingText}`,
    )
  }

  return entries
}

export function isComponentSlug(slug: string): slug is ComponentSlug {
  return UI_EXPORT_COMPONENT_SLUGS.includes(slug as ComponentSlug)
}

export const DEFAULT_COMPONENT_DOCS: readonly ComponentDoc[] = (() => {
  return buildCatalogEntries().map((entry) => buildDefaultComponentDoc(entry.slug, entry.category))
})()
