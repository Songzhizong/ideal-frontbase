import { useRouterState } from "@tanstack/react-router"
import { ChevronRight, Pin, PinOff } from "lucide-react"
import * as React from "react"
import { BaseLink } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui/collapsible"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/packages/ui/hover-card"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/packages/ui/sidebar"
import { cn } from "@/packages/ui-utils"
import {
  filterNavGroupsByPermission,
  flattenNavGroups,
  hasChildren,
  isLeafActive,
  isParentActive,
  type ParentLayoutNavItem,
} from "../nav-utils"
import type { LayoutNavGroup, LayoutNavItem, LayoutPermissionChecker } from "../types"

interface AppSidebarProps {
  groups: readonly LayoutNavGroup[]
  permissionChecker?: LayoutPermissionChecker
  collapsible: "offcanvas" | "icon" | "none"
  showLabel?: boolean
  brand?: React.ReactNode
  appTitle?: string
}

function NavIcon({ item }: { item: LayoutNavItem }) {
  if (item.icon) {
    return <item.icon className="size-4.5! shrink-0" />
  }

  return (
    <span className="text-xs font-semibold text-current" aria-hidden>
      {item.title.slice(0, 1)}
    </span>
  )
}

export function AppSidebar({
  groups,
  permissionChecker,
  collapsible,
  showLabel = true,
  brand,
  appTitle = import.meta.env.VITE_APP_TITLE ?? "App",
}: AppSidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { isMobile, state } = useSidebar()

  const iconOnly = !showLabel
  const isDualMode = collapsible === "none" && iconOnly
  const isCollapsed = collapsible === "icon" && state === "collapsed" && !isMobile
  const isIconMode = iconOnly || isCollapsed
  const visibleGroups = React.useMemo(() => {
    return filterNavGroupsByPermission(groups, permissionChecker)
  }, [groups, permissionChecker])
  const visibleItems = React.useMemo(() => {
    return flattenNavGroups(visibleGroups)
  }, [visibleGroups])
  const showGroupSection = visibleGroups.length > 1

  const sidebarBrand = brand ?? (
    <div className="flex h-14 items-center px-5">
      <span className="min-w-0 truncate text-base font-bold tracking-tight text-foreground">
        {appTitle}
      </span>
    </div>
  )

  const activeRouteItem = React.useMemo(() => {
    return (
      visibleItems.find((item) =>
        hasChildren(item) ? isParentActive(item, pathname) : isLeafActive(item, pathname),
      ) ?? null
    )
  }, [pathname, visibleItems])

  const activeChildParent = React.useMemo(() => {
    if (!activeRouteItem || !hasChildren(activeRouteItem)) {
      return null
    }

    return activeRouteItem
  }, [activeRouteItem])

  const activeLeafItem = React.useMemo(() => {
    if (!activeRouteItem || hasChildren(activeRouteItem)) {
      return null
    }

    return activeRouteItem
  }, [activeRouteItem])

  const [dualPinned, setDualPinned] = React.useState(false)
  const [dualPanelOpen, setDualPanelOpen] = React.useState(() => Boolean(activeChildParent))
  const [dualParentTo, setDualParentTo] = React.useState<string | null>(
    activeChildParent?.to ?? null,
  )

  const dualParent = React.useMemo(() => {
    if (!dualParentTo) {
      return null
    }

    return (
      visibleItems.find(
        (item): item is ParentLayoutNavItem => hasChildren(item) && item.to === dualParentTo,
      ) ?? null
    )
  }, [dualParentTo, visibleItems])

  React.useEffect(() => {
    if (!isDualMode) {
      return
    }

    if (!activeChildParent) {
      setDualPanelOpen(false)
      setDualParentTo(null)
      return
    }

    setDualParentTo(activeChildParent.to)
    setDualPanelOpen(true)
  }, [activeChildParent, isDualMode])

  const openDualPanel = React.useCallback((item: ParentLayoutNavItem) => {
    setDualParentTo(item.to)
    setDualPanelOpen(true)
  }, [])

  const handleDualMouseLeave = React.useCallback(() => {
    if (!dualPinned) {
      setDualPanelOpen(false)
    }
  }, [dualPinned])

  const dualExpanded = isDualMode && dualPanelOpen && Boolean(dualParent)

  if (isDualMode) {
    return (
      <Sidebar
        collapsible={collapsible}
        onMouseLeave={handleDualMouseLeave}
        className={cn(
          "sticky top-0 h-screen overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear",
          dualExpanded ? "w-(--sidebar-width)" : "w-(--sidebar-width-icon)",
        )}
      >
        <div className="flex h-full min-h-0">
          <div className="flex w-(--sidebar-width-icon) shrink-0 flex-col">
            <SidebarHeader className="p-0">{sidebarBrand}</SidebarHeader>
            <SidebarContent className="scrollbar-thin gap-0.5 px-3 py-2">
              {visibleGroups.map((group, groupIndex) => (
                <SidebarGroup
                  key={`${group.title ?? "group"}-${groupIndex}`}
                  className={cn(
                    "p-0",
                    showGroupSection && groupIndex > 0
                      ? group.title
                        ? "mt-1.5 pt-1.5"
                        : "mt-0.5 pt-0.5"
                      : null,
                  )}
                >
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-0.5">
                      {group.items.map((item) => {
                        if (hasChildren(item)) {
                          const itemSelected = dualPanelOpen && dualParentTo === item.to
                          const itemActive =
                            itemSelected ||
                            (activeChildParent?.to === item.to &&
                              (!dualPanelOpen || dualParentTo === activeChildParent.to))

                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                type="button"
                                aria-label={item.title}
                                tooltip={item.title}
                                isActive={itemActive}
                                onClick={() => openDualPanel(item)}
                                onMouseEnter={() => {
                                  if (!dualPinned) {
                                    openDualPanel(item)
                                  }
                                }}
                                className="mx-auto size-9 justify-center rounded-lg p-0 text-sidebar-foreground/65! transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground! data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary! [&>svg]:size-4.5!"
                              >
                                <NavIcon item={item} />
                                <span className="sr-only">{item.title}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        }

                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={activeLeafItem?.to === item.to}
                              tooltip={item.title}
                              onMouseEnter={() => {
                                if (!dualPinned) {
                                  setDualPanelOpen(false)
                                  setDualParentTo(null)
                                }
                              }}
                              onClick={() => {
                                setDualPanelOpen(false)
                                setDualParentTo(null)
                              }}
                              className="mx-auto size-9 justify-center rounded-lg p-0 text-sidebar-foreground/65! transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground! data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-primary! [&>svg]:size-4.5!"
                            >
                              <BaseLink to={item.to}>
                                <NavIcon item={item} />
                                <span className="sr-only">{item.title}</span>
                              </BaseLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </div>

          <div
            className={cn(
              "min-h-0 overflow-hidden border-l border-sidebar-border bg-sidebar transition-[width,opacity] duration-200 ease-linear",
              dualExpanded
                ? "w-[calc(var(--sidebar-width)-var(--sidebar-width-icon))] opacity-100"
                : "w-0 opacity-0",
            )}
          >
            {dualParent ? (
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex h-14 items-center justify-between px-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-sidebar-foreground">
                      {appTitle}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{dualParent.title}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => setDualPinned((value) => !value)}
                    aria-label={dualPinned ? "取消固定二级菜单" : "固定二级菜单"}
                  >
                    {dualPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                  </Button>
                </div>

                <div className="scrollbar-thin flex-1 overflow-auto px-3 py-2">
                  <ul className="space-y-0.5">
                    {dualParent.children.map((subItem) => (
                      <li key={subItem.title}>
                        <BaseLink
                          to={subItem.to}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors [&>svg]:size-4.5!",
                            pathname === subItem.to
                              ? "bg-sidebar-accent font-medium text-primary!"
                              : "text-sidebar-foreground/75! hover:bg-sidebar-accent/60 hover:text-sidebar-foreground!",
                          )}
                        >
                          <NavIcon item={subItem} />
                          <span className="truncate">{subItem.title}</span>
                        </BaseLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar
      collapsible={collapsible}
      className="sticky top-0 h-screen overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="p-0">{sidebarBrand}</SidebarHeader>
      <SidebarContent className="scrollbar-thin gap-0.5 px-3 py-2">
        {visibleGroups.map((group, groupIndex) => (
          <SidebarGroup
            key={`${group.title ?? "group"}-${groupIndex}`}
            className={cn(
              "p-0",
              showGroupSection && groupIndex > 0 ? (group.title ? "mt-1.5" : "mt-0.5") : null,
            )}
          >
            {showGroupSection && !isIconMode && group.title ? (
              <SidebarGroupLabel
                className={cn(
                  "h-auto px-3 pb-1 pt-0.5 text-xs font-medium tracking-wide text-sidebar-foreground/40 uppercase",
                  groupIndex > 0 ? "mt-0.5" : null,
                )}
              >
                {group.title}
              </SidebarGroupLabel>
            ) : null}

            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  if (hasChildren(item)) {
                    const isActive = isParentActive(item, pathname)

                    if (isIconMode) {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <HoverCard openDelay={0} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <SidebarMenuButton
                                type="button"
                                aria-label={item.title}
                                isActive={isActive}
                                className="mx-auto size-9 justify-center rounded-lg p-0 text-sidebar-foreground/65! transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground! data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary! [&>svg]:size-4.5!"
                              >
                                <NavIcon item={item} />
                                <span className="sr-only">{item.title}</span>
                              </SidebarMenuButton>
                            </HoverCardTrigger>
                            <HoverCardContent
                              side="right"
                              align="start"
                              sideOffset={10}
                              className="w-56 border-sidebar-border bg-popover p-2"
                            >
                              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                                {item.title}
                              </p>
                              <ul className="space-y-1">
                                {item.children.map((subItem) => (
                                  <li key={subItem.title}>
                                    <BaseLink
                                      to={subItem.to}
                                      className={cn(
                                        "flex items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground!",
                                        pathname === subItem.to
                                          ? "bg-sidebar-accent font-medium text-primary!"
                                          : "text-sidebar-foreground/75!",
                                      )}
                                    >
                                      {subItem.title}
                                    </BaseLink>
                                  </li>
                                ))}
                              </ul>
                            </HoverCardContent>
                          </HoverCard>
                        </SidebarMenuItem>
                      )
                    }

                    return (
                      <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={isActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              type="button"
                              tooltip={item.title}
                              isActive={isActive}
                              className="mb-0.5 h-auto gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/65! transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground! data-[active=true]:bg-transparent data-[active=true]:font-medium data-[active=true]:text-primary! [&>svg]:size-4.5!"
                            >
                              <NavIcon item={item} />
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto size-4 text-sidebar-foreground/60 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub className="ml-8 mr-0 space-y-0.5 border-none px-0 py-0.5">
                              {item.children.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === subItem.to}
                                    className="mb-0.5 h-auto rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/75! transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground! data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-primary!"
                                  >
                                    <BaseLink to={subItem.to}>
                                      <span>{subItem.title}</span>
                                    </BaseLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.to}
                        tooltip={item.title}
                        className={cn(
                          "mb-0.5 h-auto gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/65! transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground! data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-primary! [&>svg]:size-4.5!",
                          isIconMode ? "mx-auto size-9 justify-center p-0" : null,
                        )}
                      >
                        <BaseLink to={item.to}>
                          <NavIcon item={item} />
                          {showLabel ? (
                            <span className="group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                          ) : null}
                        </BaseLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
