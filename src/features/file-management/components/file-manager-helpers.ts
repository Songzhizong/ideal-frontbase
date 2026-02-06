import { z } from "zod"
import type { FileCatalog } from "../types"

export const FolderSchema = z.object({
  name: z.string().min(1, "请输入文件夹名称").max(64, "名称过长"),
})

export function findCatalogPath(
  nodes: FileCatalog[],
  targetId: string,
  path: FileCatalog[] = [],
): FileCatalog[] | null {
  for (const node of nodes) {
    const nextPath = [...path, node]
    if (node.id === targetId) return nextPath
    if (node.children && node.children.length > 0) {
      const found = findCatalogPath(node.children, targetId, nextPath)
      if (found) return found
    }
  }
  return null
}

export function findCatalogNode(nodes: FileCatalog[], targetId: string): FileCatalog | null {
  for (const node of nodes) {
    if (node.id === targetId) return node
    if (node.children && node.children.length > 0) {
      const found = findCatalogNode(node.children, targetId)
      if (found) return found
    }
  }
  return null
}
