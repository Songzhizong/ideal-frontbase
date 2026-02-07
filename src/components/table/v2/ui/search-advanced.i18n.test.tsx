import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { local, stateInternal, useDataTable } from "@/components/table/v2"
import { createColumnHelper } from "../columns"
import type { FilterDefinition } from "../core/types"
import { DataTableConfigProvider } from "./config"
import { DataTableRoot } from "./root"
import { DataTableAdvancedSearch } from "./search-advanced"

type RowData = {
  id: string
  name: string
}

type Filters = {
  q: string | null
  status: "active" | "disabled" | null
}

const advancedFields: Array<FilterDefinition<Filters, keyof Filters>> = [
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "启用", value: "active" },
      { label: "禁用", value: "disabled" },
    ],
  },
]

function AdvancedSearchHarness() {
  const helper = createColumnHelper<RowData>()
  const dt = useDataTable<RowData, Filters>({
    columns: [
      helper.accessor("name", {
        header: "Name",
        cell: (ctx) => ctx.getValue(),
      }),
    ],
    dataSource: local<RowData, Filters>({
      rows: [{ id: "a", name: "Alice" }],
    }),
    state: stateInternal<Filters>({
      initial: {
        page: 1,
        size: 10,
        sort: [],
        filters: { q: null, status: null },
      },
    }),
  })

  return (
    <DataTableConfigProvider
      i18n={{
        advancedSearch: {
          fieldTriggerText: "全局字段",
          defaultPlaceholder: "全局占位",
        },
      }}
    >
      <DataTableRoot dt={dt}>
        <DataTableAdvancedSearch<Filters>
          filterKey="q"
          advancedFields={advancedFields}
          i18n={{
            advancedSearch: {
              fieldTriggerText: "局部字段",
              defaultPlaceholder: "局部占位",
            },
          }}
        />
      </DataTableRoot>
    </DataTableConfigProvider>
  )
}

describe("DataTableAdvancedSearch i18n", () => {
  it("会按覆盖链路应用局部 i18n 覆盖", () => {
    render(<AdvancedSearchHarness />)

    expect(screen.getByText("局部字段")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("局部占位")).toBeInTheDocument()
  })
})
