import { describe, expect, it } from "vitest"
import { createDataTableQueryPreset } from "./create-data-table-query-preset"

type Filters = {
  keyword: string
  status: string | null
  startTimeMs: number | null
  endTimeMs: number | null
}

describe("createDataTableQueryPreset schema validation", () => {
  it("字段 id 重复时会抛错", () => {
    expect(() =>
      createDataTableQueryPreset<Filters>({
        schema: {
          fields: [
            {
              id: "keyword",
              label: "关键字",
              kind: "text",
              binding: {
                mode: "single",
                key: "keyword",
              },
            },
            {
              id: "keyword",
              label: "关键字2",
              kind: "text",
              binding: {
                mode: "single",
                key: "keyword",
              },
            },
          ],
        },
      }),
    ).toThrow(/duplicated field id/i)
  })

  it("search 引用复合字段时会抛错", () => {
    expect(() =>
      createDataTableQueryPreset<Filters>({
        schema: {
          fields: [
            {
              id: "keywordComposite",
              label: "关键字复合",
              kind: "text",
              search: {
                enabled: true,
              },
              binding: {
                mode: "composite",
                keys: ["keyword", "status"],
                getValue: () => "",
                setValue: () => ({
                  keyword: "",
                  status: null,
                }),
                clearValue: () => ({
                  keyword: "",
                  status: null,
                }),
              },
            },
          ],
          search: {},
        },
      }),
    ).toThrow(/must use single binding/i)
  })

  it("search 启用 custom 字段时会抛错", () => {
    expect(() =>
      createDataTableQueryPreset<Filters>({
        schema: {
          fields: [
            {
              id: "customSearch",
              label: "自定义搜索",
              kind: "custom",
              search: {
                enabled: true,
              },
              binding: {
                mode: "single",
                key: "keyword",
              },
            },
          ],
          search: {},
        },
      }),
    ).toThrow(/kind "custom" is not supported/i)
  })

  it("search.defaultFieldId 不属于 search-enabled 字段时会抛错", () => {
    expect(() =>
      createDataTableQueryPreset<Filters>({
        schema: {
          fields: [
            {
              id: "keyword",
              label: "关键字",
              kind: "text",
              binding: {
                mode: "single",
                key: "keyword",
              },
            },
            {
              id: "status",
              label: "状态",
              kind: "select",
              binding: {
                mode: "single",
                key: "status",
              },
              options: [],
            },
          ],
          search: {
            defaultFieldId: "status",
          },
        },
      }),
    ).toThrow(/defaultFieldId must be included in search-enabled fields/i)
  })

  it("layout 引用不存在字段时会抛错", () => {
    expect(() =>
      createDataTableQueryPreset<Filters>({
        schema: {
          fields: [
            {
              id: "keyword",
              label: "关键字",
              kind: "text",
              binding: {
                mode: "single",
                key: "keyword",
              },
            },
          ],
        },
        layout: {
          secondary: {
            fieldIds: ["status"],
          },
        },
      }),
    ).toThrow(/unknown field/i)
  })
})
