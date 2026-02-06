import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { TableStateSnapshot } from "../types"

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

function parseHref(href: string) {
	return new URL(href, "http://localhost")
}

describe("stateUrl", () => {
	beforeEach(() => {
		urlMocks.push.mockReset()
		urlMocks.replace.mockReset()
		urlMocks.setLocation({ searchStr: "", pathname: "/list", hash: "" })
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

	it("setSnapshot 会序列化并 push URL（filters 重置 page=1，数组使用重复 key）", async () => {
		urlMocks.setLocation({
			pathname: "/list",
			hash: "#h",
			searchStr: "?x=1&t_page=9",
		})

		const { stateUrl } = await import("./url")
		const { result } = renderHook(() => stateUrl({ key: "t" }))

		const next: TableStateSnapshot<Record<string, unknown>> = {
			page: 9,
			size: 50,
			sort: [{ field: "name", order: "asc" }],
			filters: {
				q: "hello",
				status: ["a", "b"],
			},
		}

		act(() => {
			result.current.setSnapshot(next, "filters")
		})

		expect(urlMocks.push).toHaveBeenCalledTimes(1)
		const href = urlMocks.push.mock.calls[0]?.[0] as string
		const url = parseHref(href)
		const params = url.searchParams

		expect(url.pathname).toBe("/list")
		expect(url.hash).toBe("#h")
		expect(params.get("x")).toBe("1")
		expect(params.get("t_page")).toBe("1")
		expect(params.get("t_size")).toBe("50")
		expect(params.get("t_sort")).toBe("name.asc")
		expect(params.get("t_q")).toBe("hello")
		expect(params.getAll("t_status")).toEqual(["a", "b"])
	})

	it("behavior.history=replace 时使用 replace", async () => {
		urlMocks.setLocation({
			pathname: "/list",
			hash: "",
			searchStr: "",
		})

		const { stateUrl } = await import("./url")
		const { result } = renderHook(() =>
			stateUrl({
				key: "t",
				behavior: { history: "replace" },
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
})
