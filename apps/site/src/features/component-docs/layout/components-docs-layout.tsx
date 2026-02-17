import { Outlet, useRouterState } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { getComponentChineseNameBySlug } from "@/features/component-docs/content/component-docs-i18n"
import {
  COMPONENT_DOCS,
  groupComponentDocsByCategory,
} from "@/features/component-docs/data/component-docs"
import type { ComponentDoc } from "@/features/component-docs/data/types"
import type { LayoutNavGroup, LayoutNavItem } from "@/packages/layout-core"
import { BaseLink } from "@/packages/platform-router"
import { cn } from "@/packages/ui-utils"

function getComponentSlugByPath(to: string) {
  const componentPathPrefix = "/components/"

  if (!to.startsWith(componentPathPrefix)) {
    return null
  }

  const slug = to.slice(componentPathPrefix.length)
  return slug.length > 0 ? slug : null
}

function getComponentChineseName(item: LayoutNavItem) {
  const slug = getComponentSlugByPath(item.to)

  if (!slug) {
    return null
  }

  return getComponentChineseNameBySlug(slug)
}

function getComponentNavItem(doc: ComponentDoc): LayoutNavItem {
  return {
    title: doc.name,
    to: `/components/${doc.slug}`,
  }
}

function buildNavGroups(docs: readonly ComponentDoc[]): readonly LayoutNavGroup[] {
  const groupedDocs = groupComponentDocsByCategory(docs)

  return [
    {
      items: [
        {
          title: "组件总览",
          to: "/components",
        },
      ],
    },
    ...groupedDocs.map((group) => ({
      title: group.category,
      items: group.items.map(getComponentNavItem),
    })),
  ]
}

function isOverviewActive(pathname: string) {
  return pathname === "/components" || pathname === "/components/"
}

function isNavItemActive(pathname: string, item: LayoutNavItem) {
  if (item.to === "/components") {
    return isOverviewActive(pathname)
  }

  return pathname === item.to
}

function getNavItemClassname(active: boolean) {
  return cn(
    "group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
    active
      ? "border-primary/20 bg-primary/10 font-medium text-primary"
      : "border-transparent text-foreground/70 hover:bg-accent/60 hover:text-foreground",
  )
}

export function ComponentsDocsLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const navGroups = buildNavGroups(COMPONENT_DOCS)
  const contentScrollContainerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    contentScrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" })
  }, [pathname])

  return (
    <div className="flex h-full min-h-0 w-full items-stretch flex-col bg-muted/30 lg:flex-row lg:overflow-hidden">
      <aside className="min-h-0 border-r border-border/70 bg-background lg:flex lg:h-full lg:w-70 lg:min-w-70 lg:flex-col lg:overflow-hidden">
        <nav className="scrollbar-thin h-full space-y-5 overflow-y-auto px-5 py-6 lg:min-h-0 lg:flex-1">
          {navGroups.map((group, groupIndex) => (
            <section
              key={`${group.title ?? "overview"}-${groupIndex}`}
              className={cn(groupIndex > 0 ? "pt-2" : null)}
            >
              {group.title ? (
                <p className="px-3 pb-2 text-sm font-semibold tracking-wide text-muted-foreground">
                  {group.title}
                </p>
              ) : null}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const itemActive = isNavItemActive(pathname, item)
                  const componentChineseName = getComponentChineseName(item)

                  return (
                    <BaseLink
                      key={item.to}
                      to={item.to}
                      className={getNavItemClassname(itemActive)}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="truncate">{item.title}</span>
                        {componentChineseName ? (
                          <span className="shrink-0 text-foreground/60">
                            {componentChineseName}
                          </span>
                        ) : null}
                      </span>
                    </BaseLink>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>

      <section
        ref={contentScrollContainerRef}
        data-component-doc-scroll-container="true"
        className="h-full min-h-0 min-w-0 flex-1 overflow-y-auto bg-card"
      >
        <Outlet />
      </section>
    </div>
  )
}
