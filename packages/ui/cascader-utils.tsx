import type * as React from "react"
import type { CascaderOption, CascaderSearchResult } from "./cascader-types"

const PATH_SEPARATOR = "__CASCADER_PATH__"

export function pathToKey(path: string[]) {
  return path.join(PATH_SEPARATOR)
}

export function keyToPath(pathKey: string) {
  return pathKey.split(PATH_SEPARATOR)
}

export function getLabelText(label: React.ReactNode): string {
  if (typeof label === "string") {
    return label
  }
  if (typeof label === "number") {
    return String(label)
  }
  return ""
}

export function findOptionPath(options: CascaderOption[], path: string[]) {
  const selected: CascaderOption[] = []
  let currentOptions = options

  for (const value of path) {
    const target = currentOptions.find((option) => option.value === value)
    if (!target) {
      return []
    }
    selected.push(target)
    currentOptions = target.children ?? []
  }

  return selected
}

export function collectSearchResults(
  options: CascaderOption[],
  keyword: string,
  pathValues: string[] = [],
  pathLabels: string[] = [],
): CascaderSearchResult[] {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const results: CascaderSearchResult[] = []

  for (const option of options) {
    const currentPathValues = [...pathValues, option.value]
    const currentPathLabels = [...pathLabels, getLabelText(option.label)]
    const currentText = currentPathLabels.join(" / ").toLowerCase()
    const isMatch = normalizedKeyword.length === 0 || currentText.includes(normalizedKeyword)
    const hasChildren = Boolean(option.children && option.children.length > 0)

    if (!hasChildren && isMatch) {
      results.push({ path: currentPathValues, labels: currentPathLabels })
    }

    if (hasChildren) {
      results.push(
        ...collectSearchResults(
          option.children ?? [],
          normalizedKeyword,
          currentPathValues,
          currentPathLabels,
        ),
      )
    }
  }

  return results
}

export function updateChildrenByPath(
  options: CascaderOption[],
  path: string[],
  children: CascaderOption[],
): CascaderOption[] {
  if (path.length === 0) {
    return options
  }

  const [head, ...rest] = path
  return options.map((option) => {
    if (option.value !== head) {
      return option
    }
    if (rest.length === 0) {
      return { ...option, children }
    }
    return {
      ...option,
      children: updateChildrenByPath(option.children ?? [], rest, children),
    }
  })
}

export function buildColumns(options: CascaderOption[], activePath: string[]) {
  const columns: CascaderOption[][] = [options]
  let currentOptions = options

  for (const value of activePath) {
    const target = currentOptions.find((option) => option.value === value)
    if (!target || !target.children || target.children.length === 0) {
      break
    }
    columns.push(target.children)
    currentOptions = target.children
  }

  return columns
}

export function renderLabelWithHighlight(label: string, keyword: string) {
  const normalizedKeyword = keyword.trim()
  if (!normalizedKeyword) {
    return label
  }

  const start = label.toLowerCase().indexOf(normalizedKeyword.toLowerCase())
  if (start < 0) {
    return label
  }

  const before = label.slice(0, start)
  const matched = label.slice(start, start + normalizedKeyword.length)
  const after = label.slice(start + normalizedKeyword.length)

  return (
    <>
      {before}
      <span className="bg-warning-subtle text-warning-on-subtle rounded-sm px-0.5">{matched}</span>
      {after}
    </>
  )
}
