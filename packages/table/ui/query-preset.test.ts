import { describe, expect, it } from "vitest"
import type { FilterDefinition } from "../core"
import { createCrudQueryPreset } from "./query-preset"

type Filters = {
  q: string
  status: string | null
  role: string | null
}

const STATUS_FILTER: FilterDefinition<Filters, keyof Filters> = {
  key: "status",
  label: "状态",
  type: "select",
  options: [],
}

const ROLE_FILTER: FilterDefinition<Filters, keyof Filters> = {
  key: "role",
  label: "角色",
  type: "select",
  options: [],
}

describe("createCrudQueryPreset", () => {
  it("默认返回显式 search 与稳定默认值", () => {
    const query = createCrudQueryPreset<Filters>()

    expect(query.search).toEqual({})
    expect(query.quickFilters).toEqual([])
    expect(query.advancedFilters).toEqual([])
    expect(query.activeFilters).toEqual([])
    expect(query.showActiveFilters).toBe(true)
  })

  it("默认合并 quick/advanced 作为 activeFilters，并按 key 去重", () => {
    const query = createCrudQueryPreset<Filters>({
      quickFilters: [STATUS_FILTER],
      advancedFilters: [ROLE_FILTER, STATUS_FILTER],
    })

    expect((query.activeFilters ?? []).map((filter) => String(filter.key))).toEqual([
      "status",
      "role",
    ])
  })

  it("允许显式覆盖 search 与 activeFilters", () => {
    const query = createCrudQueryPreset<Filters>({
      search: false,
      quickFilters: [STATUS_FILTER],
      advancedFilters: [ROLE_FILTER],
      activeFilters: [ROLE_FILTER],
      showActiveFilters: false,
    })

    expect(query.search).toBe(false)
    expect((query.activeFilters ?? []).map((filter) => String(filter.key))).toEqual(["role"])
    expect(query.showActiveFilters).toBe(false)
  })
})
