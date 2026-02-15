import type { ComponentDoc } from "@/features/component-docs/data/types"

export const tableDoc: ComponentDoc = {
  slug: "table",
  name: "Table",
  category: "数据展示",
  status: "beta",
  since: "0.1.0",
  summary: "用于结构化数据展示，适合列表页和运营后台场景。",
  usage: "复杂表格优先复用 `@ideal-frontbase/table`，不要重复造轮子。",
  docsPath: "packages/ui/table.tsx",
  scenarios: ["用户管理列表", "订单列表", "审计记录", "监控事件看板"],
  notes: [
    "表格外层使用 `overflow-x-auto`，保证小屏可横向滚动。",
    "大数据量场景需结合分页或虚拟滚动。",
    "列定义应与业务模型对齐，避免页面中散落字段格式化逻辑。",
  ],
  api: [
    {
      name: "columns",
      type: "ColumnDef<TData>[]",
      defaultValue: "-",
      description: "列定义集合。",
    },
    {
      name: "data",
      type: "TData[]",
      defaultValue: "[]",
      description: "表格数据源。",
    },
    {
      name: "pagination",
      type: "PaginationState",
      defaultValue: "-",
      description: "分页状态。",
    },
  ],
}
