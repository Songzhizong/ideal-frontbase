import { Outlet, useRouterState } from "@tanstack/react-router"
import {
  COMPONENT_DOCS,
  groupComponentDocsByCategory,
} from "@/features/component-docs/data/component-docs"
import type { ComponentDoc } from "@/features/component-docs/data/types"
import type { LayoutNavGroup, LayoutNavItem } from "@/packages/layout-core"
import { BaseLink } from "@/packages/platform-router"
import { cn } from "@/packages/ui-utils"

const COMPONENT_CHINESE_NAME_MAP: Readonly<Record<string, string>> = {
  accordion: "手风琴",
  alert: "警告",
  "alert-dialog": "警告弹窗",
  anchor: "锚点",
  "app-sheet": "应用抽屉",
  "aspect-ratio": "宽高比",
  avatar: "头像",
  "back-top": "回到顶部",
  badge: "徽标",
  breadcrumb: "面包屑",
  button: "按钮",
  "button-md": "按钮(MD)",
  "button-group": "按钮组",
  calendar: "日历",
  card: "卡片",
  carousel: "轮播",
  cascader: "级联选择",
  chart: "图表",
  checkbox: "复选框",
  collapsible: "折叠面板",
  "color-picker": "颜色选择器",
  combobox: "组合框",
  command: "命令面板",
  "context-menu": "右键菜单",
  "copy-button": "复制按钮",
  "date-picker-rac": "日期选择器",
  "description-list": "描述列表",
  dialog: "对话框",
  direction: "方向布局",
  drawer: "抽屉",
  "dropdown-menu": "下拉菜单",
  empty: "空状态",
  field: "字段",
  form: "表单",
  "hover-card": "悬浮卡片",
  image: "图片",
  input: "输入框",
  "input-group": "输入组",
  "input-otp": "验证码输入",
  item: "条目",
  kbd: "键盘按键",
  label: "标签",
  mentions: "提及",
  menubar: "菜单栏",
  "native-select": "原生选择器",
  "navigation-menu": "导航菜单",
  pagination: "分页",
  popover: "弹出框",
  progress: "进度条",
  "qr-code": "二维码",
  "radio-group": "单选组",
  rate: "评分",
  resizable: "可调整尺寸",
  result: "结果",
  "scroll-area": "滚动区域",
  select: "选择器",
  separator: "分隔线",
  sheet: "面板",
  sidebar: "侧边栏",
  skeleton: "骨架屏",
  "skeleton-presets": "骨架预设",
  slider: "滑块",
  sonner: "轻提示",
  spinner: "加载指示器",
  "stat-card": "统计卡片",
  statistic: "统计数值",
  "status-badge": "状态徽标",
  steps: "步骤条",
  "super-date-range-picker": "高级日期范围",
  switch: "开关",
  table: "表格",
  tabs: "标签页",
  "tag-input": "标签输入",
  textarea: "多行输入",
  timeline: "时间轴",
  toggle: "切换",
  "toggle-group": "切换组",
  tooltip: "文字提示",
  tour: "漫游引导",
  transfer: "穿梭框",
  tree: "树形控件",
  "tree-select": "树选择器",
  upload: "上传",
  watermark: "水印",
  wizard: "向导",
}

function getComponentSlugByPath(to: string) {
  const componentPathPrefix = "/components/"

  if (!to.startsWith(componentPathPrefix)) {
    return null
  }

  const slug = to.slice(componentPathPrefix.length)
  return slug.length > 0 ? slug : null
}

function getComponentChineseName(item: LayoutNavItem) {
  const slug = getComponentSlugByPath(item.to)

  if (!slug) {
    return null
  }

  return COMPONENT_CHINESE_NAME_MAP[slug] ?? null
}

function getComponentNavItem(doc: ComponentDoc): LayoutNavItem {
  return {
    title: doc.name,
    to: `/components/${doc.slug}`,
  }
}

function buildNavGroups(docs: readonly ComponentDoc[]): readonly LayoutNavGroup[] {
  const groupedDocs = groupComponentDocsByCategory(docs)

  return [
    {
      items: [
        {
          title: "组件总览",
          to: "/components",
        },
      ],
    },
    ...groupedDocs.map((group) => ({
      title: group.category,
      items: group.items.map(getComponentNavItem),
    })),
  ]
}

function isOverviewActive(pathname: string) {
  return pathname === "/components" || pathname === "/components/"
}

function isNavItemActive(pathname: string, item: LayoutNavItem) {
  if (item.to === "/components") {
    return isOverviewActive(pathname)
  }

  return pathname === item.to
}

function getNavItemClassname(active: boolean) {
  return cn(
    "group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
    active
      ? "border-primary/20 bg-primary/10 font-medium text-primary"
      : "border-transparent text-foreground/70 hover:bg-accent/60 hover:text-foreground",
  )
}

export function ComponentsDocsLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const navGroups = buildNavGroups(COMPONENT_DOCS)

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/30 lg:flex-row lg:overflow-hidden">
      <aside className="border-r border-border/70 bg-background lg:flex lg:w-[280px] lg:min-w-[280px] lg:flex-col">
        <nav className="scrollbar-thin space-y-5 overflow-y-auto px-5 py-6 lg:min-h-0 lg:flex-1">
          {navGroups.map((group, groupIndex) => (
            <section
              key={`${group.title ?? "overview"}-${groupIndex}`}
              className={cn(groupIndex > 0 ? "pt-2" : null)}
            >
              {group.title ? (
                <p className="px-3 pb-2 text-sm font-semibold tracking-wide text-muted-foreground">
                  {group.title}
                </p>
              ) : null}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const itemActive = isNavItemActive(pathname, item)
                  const componentChineseName = getComponentChineseName(item)

                  return (
                    <BaseLink
                      key={item.to}
                      to={item.to}
                      className={getNavItemClassname(itemActive)}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="truncate">{item.title}</span>
                        {componentChineseName ? (
                          <span className="shrink-0 text-foreground/60">
                            {componentChineseName}
                          </span>
                        ) : null}
                      </span>
                    </BaseLink>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>

      <section
        data-component-doc-scroll-container="true"
        className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-card"
      >
        <Outlet />
      </section>
    </div>
  )
}
