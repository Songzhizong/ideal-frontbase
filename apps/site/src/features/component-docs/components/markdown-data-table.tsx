import { cn } from "@/packages/ui-utils"

type DataTablePreset = "props" | "emits" | "slots" | "types"

type DataTableRow = Record<string, unknown>

interface DataTableSpec {
  preset: DataTablePreset | null
  rows: DataTableRow[]
}

interface DataTableColumn {
  key: string
  title: string
  code?: boolean | undefined
  thClassName?: string | undefined
  tdClassName?: string | undefined
}

function getAttributeValue(tag: string, attribute: string) {
  const marker = `${attribute}=`
  const attributeIndex = tag.indexOf(marker)

  if (attributeIndex < 0) {
    return null
  }

  const quote = tag[attributeIndex + marker.length]
  if (quote !== '"' && quote !== "'") {
    return null
  }

  let cursor = attributeIndex + marker.length + 1
  let value = ""

  while (cursor < tag.length) {
    const char = tag[cursor] ?? ""
    const prev = tag[cursor - 1] ?? ""

    if (char === quote && prev !== "\\") {
      return value
    }

    value += char
    cursor += 1
  }

  return null
}

function getPreset(value: string | null): DataTablePreset | null {
  if (value === "props" || value === "emits" || value === "slots" || value === "types") {
    return value
  }

  return null
}

function parseDataRows(raw: string): DataTableRow[] | null {
  try {
    const evaluated = Function(`"use strict"; return (${raw});`)() as unknown

    if (!Array.isArray(evaluated)) {
      return null
    }

    const rows: DataTableRow[] = []

    for (const item of evaluated) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        return null
      }

      rows.push(item as DataTableRow)
    }

    return rows
  } catch {
    return null
  }
}

function parseDataTable(section: string): DataTableSpec | null {
  const trimmed = section.trim()

  if (!trimmed.startsWith("<DataTable") || !trimmed.endsWith("/>")) {
    return null
  }

  const preset = getPreset(getAttributeValue(trimmed, "preset"))
  const rawData = getAttributeValue(trimmed, ":data") ?? getAttributeValue(trimmed, "data")

  if (!rawData) {
    return null
  }

  const rows = parseDataRows(rawData)

  if (!rows || rows.length === 0) {
    return null
  }

  return {
    preset,
    rows,
  }
}

function getColumns(spec: DataTableSpec): DataTableColumn[] {
  if (spec.preset === "props") {
    return [
      { key: "name", title: "Prop", code: true, thClassName: "w-44" },
      { key: "type", title: "Type", code: true, thClassName: "w-1/3" },
      { key: "default", title: "Default", code: true, thClassName: "w-36" },
      { key: "description", title: "Description", tdClassName: "whitespace-normal break-words" },
    ]
  }

  if (spec.preset === "emits") {
    return [
      { key: "name", title: "Emit Name", code: true, thClassName: "w-44" },
      { key: "parameters", title: "Parameters", code: true, thClassName: "w-1/3" },
      { key: "description", title: "Description", tdClassName: "whitespace-normal break-words" },
    ]
  }

  if (spec.preset === "slots") {
    return [
      { key: "name", title: "Slot Name", code: true, thClassName: "w-44" },
      { key: "parameters", title: "Parameters", code: true, thClassName: "w-1/3" },
      { key: "description", title: "Description", tdClassName: "whitespace-normal break-words" },
    ]
  }

  if (spec.preset === "types") {
    return [
      { key: "name", title: "类型", code: true, thClassName: "w-56" },
      { key: "value", title: "值", tdClassName: "whitespace-normal break-words" },
    ]
  }

  const firstRow = spec.rows[0]

  if (!firstRow) {
    return []
  }

  return Object.keys(firstRow).map((key) => ({
    key,
    title: key,
    code: key === "name" || key === "type" || key === "default" || key === "parameters",
  }))
}

function formatCellValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "-"
  }

  if (typeof value === "string") {
    if (value.startsWith("`") && value.endsWith("`") && value.length >= 2) {
      return value.slice(1, -1)
    }

    return value
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false"
  }

  return String(value)
}

function renderUnionValue(value: string) {
  const tokens = value
    .split("|")
    .map((token) => token.trim())
    .filter(Boolean)

  if (tokens.length <= 1) {
    return (
      <span className="font-code text-xs leading-7 whitespace-normal break-all text-foreground">
        {value}
      </span>
    )
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {tokens.map((token) => (
        <li
          key={`${value}-${token}`}
          className="list-none rounded-md border border-border/60 bg-muted/40 px-2 py-1"
        >
          <span className="font-code text-xs break-all text-foreground">{token}</span>
        </li>
      ))}
    </ul>
  )
}

function renderCell(
  row: DataTableRow,
  column: DataTableColumn,
  rowIndex: number,
  preset: DataTablePreset | null,
) {
  const rawValue = row[column.key]
  const value = formatCellValue(rawValue)
  const required = Boolean(row.required) && column.key === "name"

  if (preset === "types" && column.key === "value") {
    return renderUnionValue(value)
  }

  if (column.code) {
    return (
      <div className="inline-flex max-w-full items-center rounded-md border border-border/60 bg-muted/40 px-2 py-1">
        <span className="font-code text-xs whitespace-normal break-all text-foreground">
          {value}
        </span>
        {required ? <span className="ml-1 text-destructive/80">*</span> : null}
      </div>
    )
  }

  return (
    <span
      className="text-sm whitespace-normal break-words text-muted-foreground"
      key={`text-${column.key}-${rowIndex}`}
    >
      {value}
    </span>
  )
}

export function renderDataTableSection(section: string, key: string) {
  const spec = parseDataTable(section)

  if (!spec) {
    return null
  }

  const columns = getColumns(spec)

  if (columns.length === 0) {
    return null
  }

  return (
    <div key={key} className="overflow-hidden rounded-lg border border-border/60">
      <table className="w-full table-fixed text-left text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={`${key}-head-${column.key}`}
                className={cn(
                  "bg-muted/40 px-4 py-3 font-semibold text-foreground",
                  column.thClassName,
                )}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spec.rows.map((row, rowIndex) => (
            <tr key={`${key}-row-${rowIndex}`} className="border-t border-border/60 align-top">
              {columns.map((column) => (
                <td
                  key={`${key}-cell-${rowIndex}-${column.key}`}
                  className={cn("px-4 py-3", column.tdClassName)}
                >
                  {renderCell(row, column, rowIndex, spec.preset)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
