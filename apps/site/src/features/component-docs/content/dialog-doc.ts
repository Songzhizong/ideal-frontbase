import type { MarkdownOnlyComponentDoc } from "@/features/component-docs/data/types"

export const dialogDoc: MarkdownOnlyComponentDoc = {
  slug: "dialog",
  name: "Dialog",
  category: "反馈与浮层",
  status: "stable",
  since: "0.1.0",
  summary: "用于在当前上下文弹出模态层，承载关键确认或补充信息。",
  renderMode: "markdown-only",
  markdownEntry: "dialog",
  usage: "仅在需要中断当前流程时使用，避免把普通信息提示做成模态。",
  docsPath: "packages/ui/dialog.tsx",
  scenarios: ["删除确认", "表单二次确认", "复杂配置弹层"],
  notes: [
    "必须提供明确标题与动作按钮。",
    "关闭后应将焦点归还触发源，保障键盘可达性。",
    "移动端场景优先评估 Drawer 是否更合适。",
  ],
  api: [
    {
      name: "open",
      type: "boolean",
      defaultValue: "-",
      description: "受控模式下的展示状态。",
    },
    {
      name: "onOpenChange",
      type: "(open: boolean) => void",
      defaultValue: "-",
      description: "打开状态变化回调。",
    },
    {
      name: "modal",
      type: "boolean",
      defaultValue: "true",
      description: "是否启用模态行为。",
    },
  ],
}
