import { act, renderHook } from "@testing-library/react"
import { parseAsBoolean, parseAsInteger, parseAsString } from "nuqs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { TableStateSnapshot } from "../types"

const basePathMocks = vi.hoisted(() => {
  let basePath = "/"
  return {
    setBasePath: (next: string) => {
      basePath = next.endsWith("/") && next !== "/" ? next.slice(0, -1) : next
    },
    stripBasePath: (path: string) => {
      if (basePath === "/") return path
      if (path === basePath) return "/"
      if (path.startsWith(`${basePath}/`)) return path.slice(basePath.length)
      return path
    },
    withBasePath: (path: string) => {
      const normalized = path.startsWith("/") ? path : `/${path}`
      if (basePath === "/") return normalized
      return `${basePath}${normalized}`
    },
  }
})

const urlMocks = vi.hoisted(() => {
  const push = vi.fn()
  const replace = vi.fn()
  let location = { searchStr: "", pathname: "/list", hash: "" }
  return {
    push,
    replace,
    getLocation: () => location,
    setLocation: (next: { searchStr: string; pathname: string; hash: string }) => {
      location = next
    },
  }
})

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({
    history: {
      push: urlMocks.push,
      replace: urlMocks.replace,
    },
  }),
  useLocation: () => urlMocks.getLocation(),
}))

vi.mock("@/lib/base-path", () => ({
  stripBasePath: basePathMocks.stripBasePath,
  withBasePath: basePathMocks.withBasePath,
}))

function parseHref(href: string) {
  return new URL(href, "http://localhost")
}

describe("stateUrl", () => {
  beforeEach(() => {
    urlMocks.push.mockReset()
    urlMocks.replace.mockReset()
    urlMocks.setLocation({ searchStr: "", pathname: "/list", hash: "" })
    basePathMocks.setBasePath("/")
  })

  it("getSnapshot 解析 page/size/sort/filters（含重复 key）", async () => {
    urlMocks.setLocation({
      pathname: "/list",
      hash: "",
      searchStr: "?t_page=2&t_size=20&t_sort=name.asc|age.desc&t_status=active&t_status=pending",
    })

    const { stateUrl } = await import("./url")
    const { result } = renderHook(() => stateUrl({ key: "t" }))
    const snapshot = result.current.getSnapshot()

    expect(snapshot.page).toBe(2)
    expect(snapshot.size).toBe(20)
    expect(snapshot.sort).toEqual([
      { field: "name", order: "asc" },
      { field: "age", order: "desc" },
    ])
    expect(snapshot.filters).toEqual({
      status: ["active", "pending"],
    })
  })

  it("getSnapshot 会应用 defaults", async () => {
    urlMocks.setLocation({
      pathname: "/list",
      hash: "",
      searchStr: "?t_page=1",
    })

    const { stateUrl } = await import("./url")
    const { result } = renderHook(() =>
      stateUrl({
        key: "t",
        defaults: { status: "all" },
      }),
    )

    expect(result.current.getSnapshot().filters).toEqual({ status: "all" })
  })

  it("setSnapshot 在 filters 变更时会紧凑序列化并默认 replace", async () => {
    urlMocks.setLocation({
      pathname: "/list",
      hash: "#h",
      searchStr: "?x=1&t_page=9",
    })

    const { stateUrl } = await import("./url")
    const { result } = renderHook(() =>
      stateUrl({
        key: "t",
        parsers: {
          q: parseAsString.withDefault(""),
          status: parseAsString,
        },
      }),
    )

    const next: TableStateSnapshot<{ q: string; status: string | null }> = {
      page: 9,
      size: 50,
      sort: [{ field: "name", order: "asc" }],
      filters: {
        q: "hello",
        status: "active",
      },
    }

    act(() => {
      result.current.setSnapshot(next, "filters")
    })

    expect(urlMocks.replace).toHaveBeenCalledTimes(1)
    expect(urlMocks.push).toHaveBeenCalledTimes(0)
    const href = urlMocks.replace.mock.calls[0]?.[0] as string
    const url = parseHref(href)
    const params = url.searchParams

    expect(url.pathname).toBe("/list")
    expect(url.hash).toBe("#h")
    expect(params.get("x")).toBe("1")
    expect(params.get("t_page")).toBeNull()
    expect(params.get("t_size")).toBe("50")
    expect(params.get("t_sort")).toBe("name.asc")
    expect(params.get("t_q")).toBe("hello")
    expect(params.get("t_status")).toBe("active")
  })

  it("compact 模式会删除空值，但保留 false 与 0", async () => {
    urlMocks.setLocation({
      pathname: "/list",
      hash: "",
      searchStr: "",
    })

    const { stateUrl } = await import("./url")
    const { result } = renderHook(() =>
      stateUrl({
        key: "t",
        parsers: {
          q: parseAsString.withDefault(""),
          flag: parseAsBoolean,
          count: parseAsInteger,
        },
      }),
    )

    act(() => {
      result.current.setSnapshot(
        {
          page: 1,
          size: 10,
          sort: [],
          filters: {
            q: "",
            flag: false,
            count: 0,
          },
        },
        "filters",
      )
    })

    expect(urlMocks.replace).toHaveBeenCalledTimes(1)
    const href = urlMocks.replace.mock.calls[0]?.[0] as string
    const url = parseHref(href)
    expect(url.searchParams.get("t_q")).toBeNull()
    expect(url.searchParams.get("t_flag")).toBe("false")
    expect(url.searchParams.get("t_count")).toBe("0")
  })

  it("page/sort 默认 push，filters 默认 replace", async () => {
    urlMocks.setLocation({
      pathname: "/list",
      hash: "",
      searchStr: "",
    })

    const { stateUrl } = await import("./url")
    const { result } = renderHook(() => stateUrl({ key: "t" }))

    act(() => {
      result.current.setSnapshot(
        {
          page: 2,
          size: 10,
          sort: [],
          filters: {},
        },
        "page",
      )
    })

    act(() => {
      result.current.setSnapshot(
        {
          page: 2,
          size: 10,
          sort: [],
          filters: { q: "alice" },
        },
        "filters",
      )
    })

    expect(urlMocks.push).toHaveBeenCalledTimes(1)
    expect(urlMocks.replace).toHaveBeenCalledTimes(1)
  })

  it("historyByReason 可覆盖默认行为", async () => {
    urlMocks.setLocation({
      pathname: "/list",
      hash: "",
      searchStr: "",
    })

    const { stateUrl } = await import("./url")
    const { result } = renderHook(() =>
      stateUrl({
        key: "t",
        behavior: {
          historyByReason: {
            page: "replace",
          },
        },
      }),
    )

    act(() => {
      result.current.setSnapshot(
        {
          page: 2,
          size: 10,
          sort: [],
          filters: {},
        },
        "page",
      )
    })

    expect(urlMocks.replace).toHaveBeenCalledTimes(1)
    expect(urlMocks.push).toHaveBeenCalledTimes(0)
  })

  it("resetPageOnSearchChange + 自定义 searchKey 时，搜索变化会重置 page=1", async () => {
    urlMocks.setLocation({
      pathname: "/list",
      hash: "",
      searchStr: "?t_page=9&t_size=20&t_keyword=alice",
    })

    const { stateUrl } = await import("./url")
    const { result } = renderHook(() =>
      stateUrl({
        key: "t",
        behavior: {
          resetPageOnFilterChange: false,
          resetPageOnSearchChange: true,
          searchKey: "keyword",
        },
      }),
    )

    act(() => {
      result.current.setSnapshot(
        {
          page: 9,
          size: 20,
          sort: [],
          filters: { keyword: "bob" },
        },
        "filters",
      )
    })

    expect(urlMocks.replace).toHaveBeenCalledTimes(1)
    const href = urlMocks.replace.mock.calls[0]?.[0] as string
    const url = parseHref(href)
    expect(url.searchParams.get("t_page")).toBeNull()
    expect(url.searchParams.get("t_keyword")).toBe("bob")
  })

  it("在 basepath 场景下 push 的 URL 会保留 basepath", async () => {
    basePathMocks.setBasePath("/idealtemplate")
    urlMocks.setLocation({
      pathname: "/list",
      hash: "",
      searchStr: "",
    })

    const { stateUrl } = await import("./url")
    const { result } = renderHook(() => stateUrl({ key: "t" }))

    act(() => {
      result.current.setSnapshot(
        {
          page: 2,
          size: 10,
          sort: [],
          filters: {},
        },
        "page",
      )
    })

    expect(urlMocks.push).toHaveBeenCalledTimes(1)
    const href = urlMocks.push.mock.calls[0]?.[0] as string
    const url = parseHref(href)
    expect(url.pathname).toBe("/idealtemplate/list")
  })

  it("会向 adapter 暴露 searchKey，供 UI 搜索组件自动对齐", async () => {
    const { stateUrl } = await import("./url")
    const { result } = renderHook(() =>
      stateUrl({
        key: "t",
        behavior: {
          searchKey: "keyword",
        },
      }),
    )

    expect(result.current.searchKey).toBe("keyword")
  })
})
