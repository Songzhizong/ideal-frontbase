export interface SiteNavItem {
  label: string
  to: string
  description: string
}

export const SITE_NAV_ITEMS: readonly SiteNavItem[] = [
  {
    label: "设计",
    to: "/design",
    description: "设计原则、视觉规范与页面模板",
  },
  {
    label: "研发",
    to: "/engineering",
    description: "工程约定、脚手架与开发流程",
  },
  {
    label: "组件",
    to: "/components",
    description: "组件 API、示例与最佳实践",
  },
]
