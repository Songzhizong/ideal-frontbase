import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRight, Pin, PinOff } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { NavItem } from "../nav-config"
import { SidebarBrand } from "./sidebar-brand"

type ParentNavItem = NavItem & {
  children: readonly NavItem[]
}

function hasChildren(item: NavItem): item is ParentNavItem {
  return Array.isArray(item.children) && item.children.length > 0
}

function isParentActive(item: ParentNavItem, pathname: string) {
  return item.children.some((child) => child.to === pathname) || pathname.startsWith(`${item.to}/`)
}

function isLeafActive(item: NavItem, pathname: string) {
  if (item.to === "/") {
    return pathname === "/"
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function AppSidebar({
  items,
  collapsible,
  showLabel = true,
}: {
  items: readonly NavItem[]
  collapsible: "offcanvas" | "icon" | "none"
  showLabel?: boolean
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { isMobile, state } = useSidebar()
  const appTitle = import.meta.env.VITE_APP_TITLE ?? "App"
  const iconOnly = !showLabel
  const isDualMode = collapsible === "none" && iconOnly
  const isCollapsed = collapsible === "icon" && state === "collapsed" && !isMobile
  const isIconMode = iconOnly || isCollapsed

  const activeRouteItem = React.useMemo(() => {
    return (
      items.find((item) =>
        hasChildren(item) ? isParentActive(item, pathname) : isLeafActive(item, pathname),
      ) ?? null
    )
  }, [items, pathname])

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
      items.find((item): item is ParentNavItem => hasChildren(item) && item.to === dualParentTo) ??
      null
    )
  }, [dualParentTo, items])

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

  const openDualPanel = React.useCallback((item: ParentNavItem) => {
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
            <SidebarHeader className="p-0">
              <SidebarBrand />
            </SidebarHeader>
            <SidebarContent className="scrollbar-thin px-3 py-2">
              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {items.map((item) => {
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
                              {item.icon && <item.icon className="size-4.5! shrink-0" />}
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
                            <Link to={item.to}>
                              {item.icon && <item.icon className="size-4.5! shrink-0" />}
                              <span className="sr-only">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </div>

          <div
            className={cn(
              "border-sidebar-border min-h-0 overflow-hidden border-l bg-sidebar transition-[width,opacity] duration-200 ease-linear",
              dualExpanded
                ? "w-[calc(var(--sidebar-width)-var(--sidebar-width-icon))] opacity-100"
                : "w-0 opacity-0",
            )}
          >
            {dualParent && (
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
                        <Link
                          to={subItem.to}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors [&>svg]:size-4.5!",
                            pathname === subItem.to
                              ? "bg-sidebar-accent font-medium text-primary!"
                              : "text-sidebar-foreground/75! hover:bg-sidebar-accent/60 hover:text-sidebar-foreground!",
                          )}
                        >
                          {subItem.icon && <subItem.icon className="size-4.5! shrink-0" />}
                          <span className="truncate">{subItem.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar
      collapsible={collapsible}
      className="border-sidebar-border sticky top-0 h-screen overflow-hidden border-r bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="p-0">
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin px-3 py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
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
                              {item.icon && <item.icon className="size-4.5! shrink-0" />}
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
                                  <Link
                                    to={subItem.to}
                                    className={cn(
                                      "flex items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground!",
                                      pathname === subItem.to
                                        ? "bg-sidebar-accent font-medium text-primary!"
                                        : "text-sidebar-foreground/75!",
                                    )}
                                  >
                                    {subItem.title}
                                  </Link>
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
                            {item.icon && <item.icon className="size-4.5! shrink-0" />}
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
                                  <Link to={subItem.to}>
                                    <span>{subItem.title}</span>
                                  </Link>
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
                        isIconMode && "mx-auto size-9 justify-center p-0",
                      )}
                    >
                      <Link to={item.to}>
                        {item.icon && <item.icon className="size-4.5! shrink-0" />}
                        {showLabel && (
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
