import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useEffect } from "react"
import { describe, expect, it } from "vitest"
import { local, stateInternal, useDataTable } from "@/components/table/v2"
import { createColumnHelper } from "../columns"
import type { DataTableInstance, FilterDefinition } from "../core"
import { DataTableActiveFilters } from "./active-filters"
import { DataTableRoot } from "./root"

type RowData = {
  id: string
  name: string
}

type Filters = {
  q: string
  riskScoreRange: { min: number | undefined; max: number | undefined } | null
}

function ActiveFiltersHarness(props: {
  onReady: (dt: DataTableInstance<RowData, Filters>) => void
}) {
  const helper = createColumnHelper<RowData>()
  const dt = useDataTable<RowData, Filters>({
    columns: [
      helper.accessor("name", {
        header: "Name",
        cell: (ctx) => ctx.getValue(),
      }),
    ],
    dataSource: local<RowData, Filters>({
      rows: [{ id: "u-1", name: "Alice" }],
      total: 1,
    }),
    state: stateInternal<Filters>({
      initial: {
        page: 1,
        size: 10,
        sort: [],
        filters: {
          q: "",
          riskScoreRange: { min: 0, max: undefined },
        },
      },
    }),
  })

  useEffect(() => {
    props.onReady(dt)
  }, [dt, props])

  const activeFilters: Array<FilterDefinition<Filters, keyof Filters>> = [
    {
      key: "riskScoreRange",
      label: "风险分区间",
      type: "number-range",
    },
  ]

  return (
    <DataTableRoot dt={dt}>
      <DataTableActiveFilters<Filters> filters={activeFilters} />
    </DataTableRoot>
  )
}

describe("DataTableActiveFilters", () => {
  it("清除全部会清空当前激活条件，而不是回退到初始值", async () => {
    let table: DataTableInstance<RowData, Filters> | null = null
    const user = userEvent.setup()

    render(
      <ActiveFiltersHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    await waitFor(() => expect(table).not.toBeNull())

    act(() => {
      table?.filters.set("riskScoreRange", {
        min: 12,
        max: 28,
      })
    })

    await waitFor(() => {
      expect(table?.filters.state.riskScoreRange).toEqual({ min: 12, max: 28 })
    })

    await user.click(screen.getByRole("button", { name: "清除全部" }))

    await waitFor(() => {
      expect(table?.filters.state.riskScoreRange).toBeNull()
    })
  })
})
