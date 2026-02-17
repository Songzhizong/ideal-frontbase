import { act, render, screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it } from "vitest"
import { local, stateInternal, useDataTable } from "@/packages/table"
import { createColumnHelper } from "../../columns"
import type { DataTableInstance } from "../../core/types"
import { DataTableRoot } from "./root"
import { DataTableTable } from "./table"

type RowData = {
  id: string
  name: string
}

type Filters = {
  q: string | null
}

function DragSortErrorHarness(props: {
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
      rows: [
        { id: "a", name: "Alice" },
        { id: "b", name: "Bob" },
      ],
    }),
    state: stateInternal<Filters>({
      initial: {
        page: 1,
        size: 10,
        sort: [],
        filters: { q: null },
      },
    }),
    features: {
      dragSort: {
        onReorder: async () => {
          throw new Error("reorder failed")
        },
      },
    },
    getRowId: (row) => row.id,
  })

  useEffect(() => {
    props.onReady(dt)
  }, [dt, props])

  return (
    <DataTableRoot dt={dt}>
      <DataTableTable<RowData> />
    </DataTableRoot>
  )
}

describe("DataTableTable drag-sort error", () => {
  it("onReorder 抛错后会展示非阻塞错误提示", async () => {
    let table: DataTableInstance<RowData, Filters> | null = null

    render(
      <DragSortErrorHarness
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    await waitFor(() => expect(table).not.toBeNull())

    await act(async () => {
      await table?.actions.moveRow("b", "a")
    })

    await waitFor(() => {
      expect(screen.getByText(/拖拽排序失败/)).toBeInTheDocument()
      expect(screen.getByText(/reorder failed/)).toBeInTheDocument()
    })
  })
})
