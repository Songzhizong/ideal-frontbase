import { Search } from "lucide-react"
import { pinyin } from "pinyin-pro"
import * as React from "react"
import { useBaseNavigate } from "@/packages/platform-router"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Kbd } from "@/packages/ui/kbd"
import { cn } from "@/packages/ui-utils"
import { hasChildren } from "../nav-utils"
import type { LayoutNavItem } from "../types"

interface SearchCommandProps {
  items: readonly LayoutNavItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  placeholder?: string
}

interface SearchMenuItem {
  title: string
  to: string
  icon?: LayoutNavItem["icon"]
  hierarchyTitle: string
}

function buildSearchMenuItems(items: readonly LayoutNavItem[]) {
  const result: SearchMenuItem[] = []
  const seenPaths = new Set<string>()

  const walk = (nodes: readonly LayoutNavItem[], parents: string[]) => {
    for (const item of nodes) {
      if (hasChildren(item)) {
        walk(item.children, [...parents, item.title])
        continue
      }

      if (seenPaths.has(item.to)) {
        continue
      }

      seenPaths.add(item.to)
      const hierarchy = [...parents, item.title]

      result.push({
        title: item.title,
        to: item.to,
        icon: item.icon,
        hierarchyTitle: hierarchy.join(" > "),
      })
    }
  }

  walk(items, [])

  return result
}

export function SearchCommand({
  items,
  open,
  onOpenChange,
  placeholder = "搜索菜单...",
}: SearchCommandProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const navigate = useBaseNavigate()

  const searchMenuItems = React.useMemo(() => buildSearchMenuItems(items), [items])

  const filteredMenuItems = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) {
      return searchMenuItems
    }

    return searchMenuItems.filter((item) => {
      const title = item.title.toLowerCase()
      const hierarchyTitle = item.hierarchyTitle.toLowerCase()
      const pinyinFull = pinyin(item.hierarchyTitle, { toneType: "none", type: "array" })
        .join("")
        .toLowerCase()
      const pinyinFirst = pinyin(item.hierarchyTitle, {
        pattern: "first",
        toneType: "none",
      }).toLowerCase()

      return (
        title.includes(query) ||
        hierarchyTitle.includes(query) ||
        pinyinFull.includes(query) ||
        pinyinFirst.includes(query)
      )
    })
  }, [searchMenuItems, searchQuery])

  React.useEffect(() => {
    if (!open) {
      return
    }

    setSelectedIndex(0)
    setSearchQuery("")

    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 0)
  }, [open])

  React.useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredMenuItems.length)
  }, [filteredMenuItems.length])

  React.useEffect(() => {
    if (!open) {
      return
    }

    if (selectedIndex >= filteredMenuItems.length) {
      setSelectedIndex(0)
      return
    }

    const selectedElement = itemRefs.current[selectedIndex]
    selectedElement?.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    })
  }, [filteredMenuItems.length, open, selectedIndex])

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditable =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)

      if (!open) {
        if (!isEditable && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault()
          onOpenChange(true)
        }
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        onOpenChange(false)
        return
      }

      if (event.key === "ArrowDown" && filteredMenuItems.length > 0) {
        event.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredMenuItems.length)
        return
      }

      if (event.key === "ArrowUp" && filteredMenuItems.length > 0) {
        event.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredMenuItems.length) % filteredMenuItems.length)
        return
      }

      if (event.key === "Enter" && filteredMenuItems.length > 0) {
        event.preventDefault()
        const selectedItem = filteredMenuItems[selectedIndex]
        if (selectedItem) {
          void navigate({ to: selectedItem.to })
          onOpenChange(false)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [filteredMenuItems, navigate, onOpenChange, open, selectedIndex])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>全局搜索</DialogTitle>
        <DialogDescription>输入菜单名称、拼音全拼或首字母快速跳转页面。</DialogDescription>
      </DialogHeader>

      <DialogContent
        className="w-[min(46rem,calc(100%-1rem))] overflow-hidden rounded-2xl border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur-xl"
        showCloseButton={false}
      >
        <div className="border-b border-border/50 px-4 py-2">
          <div className="flex items-center gap-3">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setSelectedIndex(0)
              }}
              placeholder={placeholder}
              className="h-10 border-0 bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0 md:text-lg"
            />
            <div className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <Kbd>Enter</Kbd>
              <Kbd>Esc</Kbd>
            </div>
          </div>
        </div>

        <div className="p-2">
          <div className="max-h-72 space-y-0.5 overflow-y-auto">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item, index) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.to}
                    ref={(element) => {
                      itemRefs.current[index] = element
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left text-sm transition-colors duration-150 focus-visible:border-primary/50 focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:outline-none",
                      index === selectedIndex
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent/50",
                    )}
                    type="button"
                    onClick={() => {
                      void navigate({ to: item.to })
                      onOpenChange(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onFocus={() => setSelectedIndex(index)}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
                      {Icon ? <Icon className="size-4" /> : <span className="size-1.5 rounded-full bg-current" />}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.hierarchyTitle}
                    </span>
                    <span className="max-w-44 truncate text-xs text-muted-foreground">{item.to}</span>
                  </button>
                )
              })
            ) : (
              <div className="py-7 text-center text-sm text-muted-foreground">
                未找到匹配的菜单
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
