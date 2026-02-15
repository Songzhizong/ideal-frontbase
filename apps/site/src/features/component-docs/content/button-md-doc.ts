import type { ComponentDoc } from "@/features/component-docs/data/types"

export const buttonMdDoc: ComponentDoc = {
  slug: "button-md",
  name: "Button (Markdown)",
  category: "基础组件",
  status: "stable",
  since: "0.1.0",
  summary: "基于 Markdown 的 Button 说明页，完整覆盖 Button 组件能力与演示。",
  usage: "优先使用 variant 表达语义，不要在业务层直接重写按钮基础样式。",
  docsPath: "packages/ui/button.tsx",
  markdownEntry: "button-md",
  renderMode: "markdown-only",
  scenarios: ["表单提交", "弹窗确认", "页面跳转", "批量操作"],
  notes: [
    "操作语义明确：主操作用 solid，次操作用 outline / ghost / pure。",
    "按钮文本使用动词短语，避免歧义文案。",
    "异步提交优先使用 ButtonLoading，避免重复点击。",
  ],
  api: [
    {
      name: "color",
      type: '"primary" | "destructive" | "success" | "warning" | "info" | "carbon" | "secondary" | "accent"',
      defaultValue: '"primary"',
      description: "控制按钮语义色与焦点环颜色。",
    },
    {
      name: "variant",
      type: '"solid" | "outline" | "dashed" | "soft" | "ghost" | "link" | "plain" | "pure" | "default" | "destructive" | "secondary"',
      defaultValue: '"solid"',
      description: "控制按钮语义与视觉样式。",
    },
    {
      name: "size",
      type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "default" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
      defaultValue: '"md"',
      description: "控制按钮尺寸和内边距。",
    },
    {
      name: "shape",
      type: '"auto" | "rounded" | "square" | "circle"',
      defaultValue: '"auto"',
      description: "控制按钮外轮廓形状。",
    },
    {
      name: "shadow",
      type: '"none" | "sm" | "md" | "lg"',
      defaultValue: '"none"',
      description: "控制按钮阴影层级。",
    },
  ],
}
