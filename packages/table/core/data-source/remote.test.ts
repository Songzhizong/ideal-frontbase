import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const reactQueryMocks = vi.hoisted(() => {
  return {
    useQuery: vi.fn(),
  }
})

vi.mock("@tanstack/react-query", () => ({
  useQuery: reactQueryMocks.useQuery,
  keepPreviousData: (previousData: unknown) => previousData,
}))

describe("remote dataSource", () => {
  beforeEach(() => {
    reactQueryMocks.useQuery.mockReset()
  })

  it("queryKey 会稳定化 filters/sort 结构，并把 sort 转换为数组传入 queryFn", async () => {
    type Filters = { b: number; a: number; createdAt: Date }
    type Row = { id: string }

    const queryFn = vi.fn(async () => ({ ok: true }))
    const { remote } = await import("./remote")
    const ds = remote<Row, Filters, { ok: boolean }>({
      queryKey: ["users"],
      queryFn,
      map: () => ({ rows: [], pageCount: 0, total: 0 }),
    })

    reactQueryMocks.useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(async () => {}),
    })

    const filters: Filters = {
      b: 2,
      a: 1,
      createdAt: new Date("2026-01-30T00:00:00.000Z"),
    }
    const sort = [{ field: "name", order: "asc" as const }]

    renderHook(() =>
      ds.use({
        page: 1,
        size: 10,
        sort,
        filters,
      }),
    )

    expect(reactQueryMocks.useQuery).toHaveBeenCalledTimes(1)
    const options = reactQueryMocks.useQuery.mock.calls[0]?.[0] as {
      queryKey: unknown[]
      queryFn: () => Promise<unknown>
    }

    expect(options.queryKey).toEqual([
      "users",
      {
        page: 1,
        size: 10,
        sort: [{ field: "name", order: "asc" }],
        filters: {
          a: 1,
          b: 2,
          createdAt: "2026-01-30T00:00:00.000Z",
        },
      },
    ])

    await options.queryFn()
    expect(queryFn).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      sort: [{ field: "name", order: "asc" }],
      filters,
    })
  })
})
