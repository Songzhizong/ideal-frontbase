import { spawnSync } from "node:child_process"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageRoot = path.resolve(__dirname, "..")
const schemaDir = path.join(packageRoot, "tokens", "schema")
const generatedDir = path.join(packageRoot, "tokens", "generated")

const outputFiles = {
  variablesCss: path.join(packageRoot, "styles", "variables.generated.css"),
  themeCss: path.join(packageRoot, "styles", "theme.generated.css"),
  mappingTs: path.join(generatedDir, "theme-token-mappings.generated.ts"),
  rootFallbackTs: path.join(generatedDir, "theme-root-fallbacks.generated.ts"),
}

const checkMode = process.argv.includes("--check")

function readJsonFile(absolutePath) {
  const raw = readFileSync(absolutePath, "utf8")
  return JSON.parse(raw)
}

function formatGeneratedContent(filePath, content) {
  const result = spawnSync("pnpm", ["exec", "biome", "format", "--stdin-file-path", filePath], {
    encoding: "utf8",
    input: content,
  })

  if ((result.status ?? 1) !== 0) {
    const detail = result.stderr?.trim() || result.stdout?.trim() || "unknown error"
    throw new Error(`Failed to format generated file ${filePath}: ${detail}`)
  }

  return result.stdout
}

function assertCssVarName(value, context) {
  if (typeof value !== "string" || !/^--[a-z0-9-]+$/.test(value)) {
    throw new Error(`Invalid css variable in ${context}: ${String(value)}`)
  }
}

function assertTupleDeclaration(value, context) {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error(`Invalid declaration tuple in ${context}`)
  }

  const [name, expression] = value
  assertCssVarName(name, `${context}[0]`)
  if (typeof expression !== "string" || expression.trim().length === 0) {
    throw new Error(`Invalid declaration expression in ${context}[1]`)
  }
}

function loadSchema() {
  const indexPath = path.join(schemaDir, "index.json")
  const index = readJsonFile(indexPath)

  if (
    typeof index !== "object" ||
    index === null ||
    typeof index.version !== "number" ||
    typeof index.darkComment !== "string" ||
    typeof index.meta !== "object" ||
    index.meta === null ||
    typeof index.meta.description !== "string" ||
    !Array.isArray(index.meta.sourceFiles) ||
    typeof index.files !== "object" ||
    index.files === null ||
    typeof index.files.root !== "string" ||
    !Array.isArray(index.files.theme)
  ) {
    throw new Error("Invalid schema index.json shape")
  }

  const rootPath = path.join(schemaDir, index.files.root)
  const rootFallbacks = readJsonFile(rootPath)
  if (!Array.isArray(rootFallbacks)) {
    throw new Error(`Invalid root declarations file: ${index.files.root}`)
  }

  for (const [i, tuple] of rootFallbacks.entries()) {
    assertTupleDeclaration(tuple, `rootFallbacks[${i}]`)
  }

  const themeDeclarations = []
  for (const fileName of index.files.theme) {
    if (typeof fileName !== "string") {
      throw new Error("Invalid theme declaration file name")
    }
    const filePath = path.join(schemaDir, fileName)
    const declarations = readJsonFile(filePath)
    if (!Array.isArray(declarations)) {
      throw new Error(`Invalid theme declarations file: ${fileName}`)
    }
    for (const [i, tuple] of declarations.entries()) {
      assertTupleDeclaration(tuple, `${fileName}[${i}]`)
      themeDeclarations.push(tuple)
    }
  }

  return {
    index,
    rootFallbacks,
    themeDeclarations,
  }
}

function renderVariablesCss(rootFallbacks, darkComment) {
  const lines = [
    "/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY. */",
    "/* Source: packages/theme-system/tokens/schema/*.json */",
    ":root {",
  ]

  for (const [name, value] of rootFallbacks) {
    lines.push(`  ${name}: ${value};`)
  }

  lines.push("}", "", ".dark {", `  /* ${darkComment} */`, "}", "")
  return lines.join("\n")
}

function renderThemeCss(themeDeclarations) {
  const lines = [
    "/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY. */",
    "/* Source: packages/theme-system/tokens/schema/*.json */",
    "@theme {",
  ]

  for (const [name, expression] of themeDeclarations) {
    lines.push(`  ${name}: ${expression};`)
  }

  lines.push("}", "")
  return lines.join("\n")
}

function parseDeclarationFormat(expression) {
  const hslVarMatch = expression.match(/^hsl\(var\((--[a-z0-9-]+)\)\)$/)
  if (hslVarMatch) {
    return { format: "hsl-var", source: hslVarMatch[1] }
  }

  const varMatch = expression.match(/^var\((--[a-z0-9-]+)\)$/)
  if (varMatch) {
    return { format: "var", source: varMatch[1] }
  }

  return { format: "literal", source: null }
}

function renderMappingTs(themeDeclarations) {
  const mappings = themeDeclarations.map(([target, expression]) => {
    const parsed = parseDeclarationFormat(expression)
    const sourcePart = parsed.source === null ? "" : `, source: ${JSON.stringify(parsed.source)}`
    return `  { target: ${JSON.stringify(target)}, expression: ${JSON.stringify(expression)}, format: ${JSON.stringify(parsed.format)}${sourcePart} },`
  })

  const sourceVariables = Array.from(
    new Set(
      themeDeclarations
        .map(([, expression]) => parseDeclarationFormat(expression).source)
        .filter((source) => source !== null),
    ),
  )

  return [
    "/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY. */",
    "/* Source: packages/theme-system/tokens/schema/*.json */",
    "",
    'export type ThemeTokenFormat = "hsl-var" | "var" | "literal"',
    "",
    "export interface ThemeTokenMapping {",
    "  target: `--" + "${" + "string}`",
    "  expression: string",
    "  format: ThemeTokenFormat",
    "  source?: `--" + "${" + "string}`",
    "}",
    "",
    "export const themeTokenMappings: ReadonlyArray<ThemeTokenMapping> = [",
    ...mappings,
    "]",
    "",
    "export const themeSourceCssVariables: ReadonlyArray<`--" + "${" + "string}`> = [",
    ...sourceVariables.map((name) => `  ${JSON.stringify(name)},`),
    "]",
    "",
  ].join("\n")
}

function renderRootFallbackTs(rootFallbacks) {
  const entries = rootFallbacks.flatMap(([name, value]) => {
    const key = JSON.stringify(name)
    const serialized = JSON.stringify(value)
    const inlineEntry = `  ${key}: ${serialized},`

    if (inlineEntry.length <= 96) {
      return [inlineEntry]
    }

    return [`  ${key}:`, `    ${serialized},`]
  })

  return [
    "/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY. */",
    "/* Source: packages/theme-system/tokens/schema/root-fallbacks.json */",
    "",
    "export const themeRootFallbacks: Readonly<Record<`--" + "${" + "string}`, string>> = {",
    ...entries,
    "}",
    "",
  ].join("\n")
}

function writeOrCheck(filePath, nextContent) {
  let currentContent = ""
  try {
    currentContent = readFileSync(filePath, "utf8")
  } catch {
    currentContent = ""
  }

  if (currentContent === nextContent) {
    return { changed: false, checked: true }
  }

  if (checkMode) {
    return { changed: true, checked: true }
  }

  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, nextContent, "utf8")
  return { changed: true, checked: false }
}

function run() {
  const { index, rootFallbacks, themeDeclarations } = loadSchema()
  const nextVariablesCss = formatGeneratedContent(
    outputFiles.variablesCss,
    renderVariablesCss(rootFallbacks, index.darkComment),
  )
  const nextThemeCss = formatGeneratedContent(
    outputFiles.themeCss,
    renderThemeCss(themeDeclarations),
  )
  const nextMappingTs = formatGeneratedContent(
    outputFiles.mappingTs,
    renderMappingTs(themeDeclarations),
  )
  const nextRootFallbackTs = formatGeneratedContent(
    outputFiles.rootFallbackTs,
    renderRootFallbackTs(rootFallbacks),
  )

  const results = [
    writeOrCheck(outputFiles.variablesCss, nextVariablesCss),
    writeOrCheck(outputFiles.themeCss, nextThemeCss),
    writeOrCheck(outputFiles.mappingTs, nextMappingTs),
    writeOrCheck(outputFiles.rootFallbackTs, nextRootFallbackTs),
  ]

  if (checkMode) {
    const hasDiff = results.some((result) => result.changed)
    if (hasDiff) {
      console.error("Theme token generated artifacts are out of date.")
      console.error("Run: pnpm -C packages/theme-system tokens:generate")
      process.exit(1)
    }
    console.log("Theme token generated artifacts are up to date.")
    return
  }

  const changedCount = results.filter((result) => result.changed).length
  console.log(`Theme token artifacts generated. Updated files: ${changedCount}`)
}

run()
