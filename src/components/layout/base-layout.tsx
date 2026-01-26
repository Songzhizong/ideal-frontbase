import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import AppLogo from "@/assets/logo.svg";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronRight, Command, LayoutGrid, LineChart, Search, Settings, Sparkles, Users, } from "lucide-react";
import * as React from "react";
import { useUiStore } from "@/hooks/use-ui-store";
import { ThemeSettingsDrawer } from "./theme-settings-drawer";

const PRIMARY_NAV = [
  {title: "Overview", to: "/", icon: LayoutGrid},
  {title: "Automation", to: "/automation", icon: Sparkles},
  {title: "Insights", to: "/analytics", icon: LineChart},
  {title: "Team", to: "/team", icon: Users},
  {title: "Settings", to: "/settings", icon: Settings}
] as const;

const SECONDARY_NAV = [{title: "Settings", to: "/settings", icon: Settings}] as const;

export function BaseLayout({children}: { children: React.ReactNode }) {
  const {
    headerHeight,
    showBreadcrumb,
    showBreadcrumbIcon,
    borderRadius,
    sidebarWidth,
    sidebarCollapsedWidth,
    containerWidth,
    boxStyle,
    pageAnimation,
    menuLayout,
    themeColors,
  } = useUiStore();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);


  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.style.setProperty("--radius", `${borderRadius}px`);
    root.style.setProperty("--color-primary", themeColors.primary);
    root.style.setProperty("--color-success", themeColors.success);
    root.style.setProperty("--color-warning", themeColors.warning);
    root.style.setProperty("--color-error", themeColors.error);
  }, [borderRadius, themeColors]);

  React.useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isEditable) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, {passive: true});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const routeLabels = React.useMemo(() => {
    const entries: Array<[string, string]> = [
      ...PRIMARY_NAV,
      ...SECONDARY_NAV,
    ].map((item) => [item.to, item.title]);
    return new Map<string, string>(entries);
  }, []);

  const breadcrumbLabel = routeLabels.get(pathname) ?? "Overview";

  const breadcrumbs = [
    {label: "Signal", to: "/"},
    {label: breadcrumbLabel, to: pathname},
  ];

  return (
    <SidebarProvider
      className="bg-transparent "
      sidebarWidth={sidebarWidth}
      sidebarCollapsedWidth={sidebarCollapsedWidth}
    >
      <Sidebar
        collapsible={menuLayout === "dual" ? "none" : "icon"}
        className={cn(
          "sticky top-0 h-screen transition-all duration-300 px-1",
          "bg-sidebar border-sidebar-border text-sidebar-foreground",
        )}
      >
        <SidebarHeader>
          <SidebarBrand/>
        </SidebarHeader>
        <SidebarContent className="space-y-6">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {PRIMARY_NAV.map((item) => (
                  <SidebarNavItem
                    key={item.title}
                    item={item}
                    isActive={pathname === item.to}
                    showLabel={menuLayout === "single"}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="flex min-h-screen flex-1 flex-col">
        <header
          className={cn(
            "sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 transition-colors sm:px-6",
            isScrolled ? "border-border" : "border-transparent",
          )}
          style={{height: `${headerHeight}px`}}
        >
          <div className="flex items-center gap-4">
            <SidebarTrigger/>
            {showBreadcrumb && (
              <nav
                className="hidden items-center text-sm text-muted-foreground md:flex"
                aria-label="Breadcrumb"
              >
                <ol className="flex items-center gap-2">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.label} className="flex items-center gap-2">
                      {index > 0 ? (
                        <ChevronRight className="size-3 text-muted-foreground/50"/>
                      ) : null}
                      {index < breadcrumbs.length - 1 ? (
                        <Link
                          to={crumb.to}
                          className="flex items-center gap-1 transition hover:text-foreground"
                        >
                          {showBreadcrumbIcon && index === 0 && <LayoutGrid className="size-3"/>}
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          {showBreadcrumbIcon && crumb.to === pathname && (
                            PRIMARY_NAV.find(n => n.to === pathname)?.icon ?
                              React.createElement(PRIMARY_NAV.find(n => n.to === pathname)!.icon, {className: "size-3"}) :
                              null
                          )}
                          {crumb.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden items-center gap-3 rounded-full px-4 md:flex"
              onClick={() => setSearchOpen(true)}
              aria-keyshortcuts="Meta+K Control+K"
            >
              <Search className="size-4"/>
              Search
              <span
                className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                cmd k
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-full p-0 md:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <Search className="size-4"/>
            </Button>
            <ThemeSettingsDrawer/>
            <Button
              variant="ghost"
              size="sm"
              className="relative h-10 w-10 rounded-full p-0"
              aria-label="Notifications"
            >
              <Bell className="size-4"/>
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-amber-400"/>
            </Button>
          </div>
        </header>

        <main className={cn("flex-1 overflow-x-hidden", pageAnimation !== "none" && `animate-${pageAnimation}`)}>
          <div className={cn(
            "transition-all duration-300",
            containerWidth === "fixed" ? "mx-auto max-w-7xl" : "w-full",
            boxStyle === "shadow" ? "m-4 rounded-xl bg-card shadow-xl shadow-black/5" : "h-full",
            boxStyle === "border" && cn(
              "border-border",
              containerWidth === "fixed" && "border-l"
            )
          )}>
            {children}
          </div>
        </main>
      </div>

      {searchOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-4 py-12 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
          >
            <div className="flex items-center gap-3">
              <Command className="size-4 text-muted-foreground"/>
              <Input
                ref={searchInputRef}
                placeholder="Search metrics, teammates, and playbooks..."
                className="h-11 border-border/50 bg-background"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full px-3"
                onClick={() => setSearchOpen(false)}
              >
                Esc
              </Button>
            </div>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Suggested
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Revenue pulse by region",
                  "Pipeline velocity report",
                  "Customer health playbook",
                  "Upcoming syncs",
                ].map((item) => (
                  <button
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-border/50 bg-background px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:border-border hover:bg-accent"
                    type="button"
                  >
                    {item}
                    <ChevronRight className="size-4 text-muted-foreground"/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </SidebarProvider>
  );
}

type NavItem = (typeof PRIMARY_NAV)[number] | (typeof SECONDARY_NAV)[number];

function SidebarNavItem({
                          item,
                          isActive,
                          showLabel = true,
                        }: {
  item: NavItem;
  isActive: boolean;
  showLabel?: boolean;
}) {
  const {state, isMobile} = useSidebar();
  const collapsed = (state === "collapsed" && !isMobile) || !showLabel;
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
      >
        <Link to={item.to}>
          <Icon className="size-4 shrink-0"/>
          {!collapsed && <span>{item.title}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarBrand() {
  const {state, isMobile} = useSidebar();
  const {menuLayout, theme} = useUiStore();
  const collapsed = (state === "collapsed" && !isMobile) || menuLayout === "dual";
  const appTitle = import.meta.env.VITE_APP_TITLE ?? "App";

  const [isSidebarDark, setIsSidebarDark] = React.useState(false);

  React.useEffect(() => {
    const checkDark = () => {
      if (typeof window === "undefined") return false;
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return theme === "dark" || (theme === "system" && isSystemDark);
    };
    setIsSidebarDark(checkDark());

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => setIsSidebarDark(checkDark());
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-2",
        collapsed && "justify-center px-0",
      )}
    >
      <img
        src={AppLogo}
        alt={`${appTitle} logo`}
        className={cn(
          "h-8 w-auto",
          collapsed && "h-7",
          isSidebarDark && "brightness-200 contrast-150 invert",
        )}
      />
      {!collapsed && (
        <span
          className={cn(
            "text-lg font-semibold uppercase tracking-[0.2em]",
            isSidebarDark ? "text-sidebar-foreground" : "text-foreground",
          )}
        >
          {appTitle}
        </span>
      )}
    </div>
  );
}
