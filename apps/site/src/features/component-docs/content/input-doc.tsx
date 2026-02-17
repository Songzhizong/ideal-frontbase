import type { ComponentDoc } from "@/features/component-docs/data/types"

export const inputDoc: ComponentDoc = {
  slug: "input",
  name: "Input",
  category: "表单与输入",
  status: "stable",
  since: "0.1.0",
  summary: "用于采集单行文本输入，支持表单场景快速接入。",
  usage: "统一通过表单状态管理（如 react-hook-form）控制值与校验。",
  docsPath: "packages/ui/input.tsx",
  markdownEntry: "input",
  renderMode: "markdown-only",
  scenarios: ["登录表单", "搜索输入", "筛选条件", "配置项编辑"],
  notes: [
    "必须提供标签或可访问名称，避免无语义输入框。",
    "输入错误时配合错误提示与状态边框展示。",
    "搜索类输入建议加防抖逻辑，避免频繁请求。",
  ],
  api: [
    {
      name: "type",
      type: "string",
      defaultValue: "'text'",
      description: "原生输入类型，如 text/password/email。",
    },
    {
      name: "placeholder",
      type: "string",
      defaultValue: "-",
      description: "输入提示文本。",
    },
    {
      name: "disabled",
      type: "boolean",
      defaultValue: "false",
      description: "禁用输入。",
    },
  ],
}
