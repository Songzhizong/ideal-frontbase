import schemaIndexJson from "./schema/index.json"
import rootFallbacksJson from "./schema/root-fallbacks.json"
import themeColorsCoreJson from "./schema/theme-colors-core.json"
import themeColorsExtendedJson from "./schema/theme-colors-extended.json"
import themeFoundationJson from "./schema/theme-foundation.json"

export type CssVariableName = `--${string}`
export type TokenDeclaration = readonly [CssVariableName, string]

interface SchemaMeta {
  description: string
  sourceFiles: ReadonlyArray<string>
}

interface SchemaIndex {
  version: number
  meta: SchemaMeta
  darkComment: string
  files: {
    root: string
    theme: ReadonlyArray<string>
  }
}

export interface TokenSchema {
  version: number
  meta: SchemaMeta
  darkComment: string
  rootFallbacks: ReadonlyArray<TokenDeclaration>
  themeDeclarations: ReadonlyArray<TokenDeclaration>
}

function isCssVariableName(value: unknown): value is CssVariableName {
  return typeof value === "string" && /^--[a-z0-9-]+$/.test(value)
}

function normalizeTupleList(
  tuples: ReadonlyArray<ReadonlyArray<string>>,
  sectionName: string,
): ReadonlyArray<TokenDeclaration> {
  return tuples.map((tuple, index) => {
    if (tuple.length !== 2) {
      throw new Error(`Invalid declaration tuple length at ${sectionName}[${index}]`)
    }

    const name = tuple[0]
    const value = tuple[1]
    if (!isCssVariableName(name)) {
      throw new Error(`Invalid css variable name at ${sectionName}[${index}]: ${name}`)
    }

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Invalid token value at ${sectionName}[${index}]`)
    }

    return [name, value] as const
  })
}

function assertSchemaIndex(value: unknown): asserts value is SchemaIndex {
  if (typeof value !== "object" || value === null) {
    throw new Error("Invalid schema index")
  }

  const index = value as Partial<SchemaIndex>
  if (typeof index.version !== "number") {
    throw new Error("Invalid schema version")
  }

  if (typeof index.darkComment !== "string") {
    throw new Error("Invalid schema dark comment")
  }

  if (
    typeof index.meta !== "object" ||
    index.meta === null ||
    typeof index.meta.description !== "string" ||
    !Array.isArray(index.meta.sourceFiles)
  ) {
    throw new Error("Invalid schema meta")
  }

  if (
    typeof index.files !== "object" ||
    index.files === null ||
    typeof index.files.root !== "string" ||
    !Array.isArray(index.files.theme)
  ) {
    throw new Error("Invalid schema files")
  }
}

const schemaIndexCandidate: unknown = schemaIndexJson
assertSchemaIndex(schemaIndexCandidate)
const schemaIndex = schemaIndexCandidate

const rootFallbacks = normalizeTupleList(rootFallbacksJson, "rootFallbacks")
const themeDeclarations = normalizeTupleList(
  [...themeColorsCoreJson, ...themeColorsExtendedJson, ...themeFoundationJson],
  "themeDeclarations",
)

export const tokenSchema: TokenSchema = {
  version: schemaIndex.version,
  meta: schemaIndex.meta,
  darkComment: schemaIndex.darkComment,
  rootFallbacks,
  themeDeclarations,
}
