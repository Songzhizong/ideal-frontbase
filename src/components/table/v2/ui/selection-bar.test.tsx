import { act, render, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it, vi } from "vitest"
import { local, stateInternal, useDataTable } from "@/components/table/v2"
import { createColumnHelper } from "../columns"
import type { DataTableInstance } from "../core/types"
import { DataTableRoot } from "./root"
import { DataTableSelectionBar } from "./selection-bar"

type RowData = {
  id: string
  name: string
}

type Filters = {
  q: string | null
}

function SelectionBarHarness(props: {
  onReady: (dt: DataTableInstance<RowData, Filters>) => void
  actionsSpy: (args: unknown) => void
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
      total: 5,
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
      selection: {
        mode: "cross-page",
        crossPage: {
          selectAllStrategy: "client",
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
      <DataTableSelectionBar<RowData, Filters>
        actions={(args) => {
          props.actionsSpy(args)
          return null
        }}
      />
    </DataTableRoot>
  )
}

describe("DataTableSelectionBar", () => {
  it("actions 回调可以直接消费 selectionScope 与导出 payload", async () => {
    const actionsSpy = vi.fn()
    let table: DataTableInstance<RowData, Filters> | null = null

    render(
      <SelectionBarHarness
        actionsSpy={actionsSpy}
        onReady={(dt) => {
          table = dt
        }}
      />,
    )

    await waitFor(() => expect(table).not.toBeNull())

    act(() => {
      table?.actions.selectAllCurrentPage()
    })

    await waitFor(() => {
      const latestCall = actionsSpy.mock.calls.at(-1)?.[0]
      expect(latestCall?.selectionScope).toEqual({
        type: "ids",
        rowIds: ["a", "b"],
      })
      expect(latestCall?.exportPayload).toEqual({
        type: "ids",
        rowIds: ["a", "b"],
      })
    })

    await act(async () => {
      await table?.actions.selectAllMatching()
    })

    await waitFor(() => {
      const latestCall = actionsSpy.mock.calls.at(-1)?.[0]
      expect(latestCall?.selectionScope).toEqual({
        type: "all",
        excludedRowIds: [],
      })
      expect(latestCall?.exportPayload).toEqual({
        type: "all",
        excludedRowIds: [],
        filters: { q: null },
      })
    })
  })
})
