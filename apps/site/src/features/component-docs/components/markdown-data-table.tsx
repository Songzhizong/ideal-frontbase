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

function readBalancedLiteralAttributeValue(tag: string, startIndex: number, quote: "'" | '"') {
  let cursor = startIndex

  while (cursor < tag.length) {
    const current = tag[cursor]
    if (!current || !/\s/.test(current)) {
      break
    }
    cursor += 1
  }

  const first = tag[cursor]
  if (first !== "[" && first !== "{") {
    return null
  }

  const expectedStack: string[] = [first === "[" ? "]" : "}"]
  let stringQuote: "'" | '"' | "`" | null = null
  let escaped = false
  cursor += 1

  while (cursor < tag.length) {
    const current = tag[cursor]

    if (!current) {
      break
    }

    if (stringQuote) {
      if (escaped) {
        escaped = false
        cursor += 1
        continue
      }

      if (current === "\\") {
        escaped = true
        cursor += 1
        continue
      }

      if (current === stringQuote) {
        stringQuote = null
        cursor += 1
        continue
      }

      cursor += 1
      continue
    }

    if (current === "'" || current === '"' || current === "`") {
      stringQuote = current
      cursor += 1
      continue
    }

    if (current === "[" || current === "{") {
      expectedStack.push(current === "[" ? "]" : "}")
      cursor += 1
      continue
    }

    if (current === "]" || current === "}") {
      const expected = expectedStack[expectedStack.length - 1]

      if (current !== expected) {
        return null
      }

      expectedStack.pop()
      cursor += 1

      if (expectedStack.length === 0) {
        let tailCursor = cursor
        while (tailCursor < tag.length) {
          const tailChar = tag[tailCursor]
          if (!tailChar || !/\s/.test(tailChar)) {
            break
          }
          tailCursor += 1
        }

        if (tag[tailCursor] !== quote) {
          return null
        }

        return tag.slice(startIndex, cursor)
      }

      continue
    }

    cursor += 1
  }

  return null
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

  const startIndex = attributeIndex + marker.length + 1

  if (attribute === ":data" || attribute === "data") {
    const literalValue = readBalancedLiteralAttributeValue(tag, startIndex, quote)
    if (literalValue !== null) {
      return literalValue
    }
  }

  let cursor = startIndex
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

type LiteralValue =
  | string
  | number
  | boolean
  | null
  | LiteralValue[]
  | {
      [key: string]: LiteralValue
    }

class LiteralParser {
  private readonly input: string
  private cursor = 0

  constructor(input: string) {
    this.input = input
  }

  parse() {
    this.skipWhitespace()
    const value = this.parseValue()
    this.skipWhitespace()

    if (!this.isEnd()) {
      throw new Error("Unexpected token")
    }

    return value
  }

  private parseValue(): LiteralValue {
    this.skipWhitespace()
    const char = this.peek()

    if (!char) {
      throw new Error("Unexpected end of input")
    }

    if (char === "[") {
      return this.parseArray()
    }

    if (char === "{") {
      return this.parseObject()
    }

    if (char === "'" || char === '"' || char === "`") {
      return this.parseString(char)
    }

    if (char === "-" || this.isDigit(char)) {
      return this.parseNumber()
    }

    if (this.matchKeyword("true")) {
      return true
    }

    if (this.matchKeyword("false")) {
      return false
    }

    if (this.matchKeyword("null")) {
      return null
    }

    throw new Error(`Unexpected token "${char}"`)
  }

  private parseArray(): LiteralValue[] {
    this.consume("[")
    this.skipWhitespace()

    const result: LiteralValue[] = []

    while (true) {
      this.skipWhitespace()

      if (this.peek() === "]") {
        this.consume("]")
        return result
      }

      result.push(this.parseValue())
      this.skipWhitespace()

      const char = this.peek()

      if (char === ",") {
        this.consume(",")
        this.skipWhitespace()
        continue
      }

      if (char === "]") {
        this.consume("]")
        return result
      }

      throw new Error(`Unexpected token "${char ?? "EOF"}" in array`)
    }
  }

  private parseObject(): {
    [key: string]: LiteralValue
  } {
    this.consume("{")
    this.skipWhitespace()

    const result: {
      [key: string]: LiteralValue
    } = {}

    while (true) {
      this.skipWhitespace()

      if (this.peek() === "}") {
        this.consume("}")
        return result
      }

      const key = this.parseObjectKey()
      this.skipWhitespace()
      this.consume(":")
      this.skipWhitespace()
      result[key] = this.parseValue()
      this.skipWhitespace()

      const char = this.peek()

      if (char === ",") {
        this.consume(",")
        this.skipWhitespace()
        continue
      }

      if (char === "}") {
        this.consume("}")
        return result
      }

      throw new Error(`Unexpected token "${char ?? "EOF"}" in object`)
    }
  }

  private parseObjectKey() {
    const char = this.peek()

    if (char === "'" || char === '"' || char === "`") {
      return this.parseString(char)
    }

    if (!char || !this.isIdentifierStart(char)) {
      throw new Error(`Invalid object key "${char ?? "EOF"}"`)
    }

    let value = ""

    while (!this.isEnd()) {
      const current = this.peek()

      if (!current || !this.isIdentifierPart(current)) {
        break
      }

      value += current
      this.cursor += 1
    }

    return value
  }

  private parseNumber() {
    let value = ""

    if (this.peek() === "-") {
      value += "-"
      this.cursor += 1
    }

    while (!this.isEnd()) {
      const char = this.peek()
      if (!char || !this.isDigit(char)) {
        break
      }

      value += char
      this.cursor += 1
    }

    if (this.peek() === ".") {
      value += "."
      this.cursor += 1

      while (!this.isEnd()) {
        const char = this.peek()
        if (!char || !this.isDigit(char)) {
          break
        }

        value += char
        this.cursor += 1
      }
    }

    if (value === "-" || value === "" || value === ".") {
      throw new Error("Invalid number")
    }

    const parsed = Number(value)
    if (Number.isNaN(parsed)) {
      throw new Error("Invalid number")
    }

    return parsed
  }

  private parseString(quote: "'" | '"' | "`") {
    this.consume(quote)
    let value = ""

    while (!this.isEnd()) {
      const char = this.peek()

      if (!char) {
        break
      }

      if (char === "\\") {
        this.cursor += 1
        const escaped = this.peek()
        if (!escaped) {
          throw new Error("Invalid escape sequence")
        }

        value += this.unescapeChar(escaped)
        this.cursor += 1
        continue
      }

      if (char === quote) {
        this.cursor += 1
        return value
      }

      value += char
      this.cursor += 1
    }

    throw new Error("Unclosed string")
  }

  private unescapeChar(char: string) {
    if (char === "n") {
      return "\n"
    }

    if (char === "r") {
      return "\r"
    }

    if (char === "t") {
      return "\t"
    }

    if (char === "\\") {
      return "\\"
    }

    if (char === "'" || char === '"' || char === "`") {
      return char
    }

    return char
  }

  private matchKeyword(keyword: "true" | "false" | "null") {
    if (!this.input.startsWith(keyword, this.cursor)) {
      return false
    }

    const nextChar = this.input[this.cursor + keyword.length]
    if (nextChar && this.isIdentifierPart(nextChar)) {
      return false
    }

    this.cursor += keyword.length
    return true
  }

  private consume(expected: string) {
    if (this.peek() !== expected) {
      throw new Error(`Expected "${expected}"`)
    }

    this.cursor += 1
  }

  private peek() {
    return this.input[this.cursor] ?? null
  }

  private isEnd() {
    return this.cursor >= this.input.length
  }

  private skipWhitespace() {
    while (!this.isEnd()) {
      const char = this.peek()
      if (!char || !/\s/.test(char)) {
        break
      }

      this.cursor += 1
    }
  }

  private isDigit(char: string) {
    return /^[0-9]$/.test(char)
  }

  private isIdentifierStart(char: string) {
    return /^[A-Za-z_$]$/.test(char)
  }

  private isIdentifierPart(char: string) {
    return /^[A-Za-z0-9_$]$/.test(char)
  }
}

function parseDataRows(raw: string): DataTableRow[] | null {
  try {
    const parser = new LiteralParser(raw)
    const evaluated = parser.parse()

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
