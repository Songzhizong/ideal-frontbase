import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  ChevronsUpDown,
  Command,
  LayoutGrid,
  LineChart,
  LogOut,
  Palette,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import * as React from "react";

const THEME_STORAGE_KEY = "ui:theme";

const PRIMARY_NAV = [
  { title: "Overview", to: "/", icon: LayoutGrid },
  { title: "Automation", to: "/automation", icon: Sparkles },
  { title: "Insights", to: "/analytics", icon: LineChart },
  { title: "Team", to: "/team", icon: Users },
] as const;

const SECONDARY_NAV = [{ title: "Settings", to: "/settings", icon: Settings }] as const;

type ThemeMode = "dawn" | "tide";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<ThemeMode>("dawn");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "dawn" || storedTheme === "tide") {
      setTheme(storedTheme);
    }
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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

  const routeLabels = React.useMemo(() => {
    const entries: Array<[string, string]> = [
      ...PRIMARY_NAV,
      ...SECONDARY_NAV,
    ].map((item) => [item.to, item.title]);
    return new Map<string, string>(entries);
  }, []);

  const breadcrumbLabel = routeLabels.get(pathname) ?? "Overview";

  const breadcrumbs = [
    { label: "Signal", to: "/" },
    { label: breadcrumbLabel, to: pathname },
  ];

  return (
    <SidebarProvider className="bg-transparent">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarBrand />
        </SidebarHeader>
        <SidebarContent className="space-y-6">
          <SidebarGroup>
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {PRIMARY_NAV.map((item) => (
                  <SidebarNavItem
                    key={item.title}
                    item={item}
                    isActive={pathname === item.to}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SECONDARY_NAV.map((item) => (
                  <SidebarNavItem
                    key={item.title}
                    item={item}
                    isActive={pathname === item.to}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarProfile />
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/60 bg-white/70 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <nav
              className="hidden items-center text-sm text-slate-500 md:flex"
              aria-label="Breadcrumb"
            >
              <ol className="flex items-center gap-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.label} className="flex items-center gap-2">
                    {index > 0 ? (
                      <ChevronRight className="size-3 text-slate-400" />
                    ) : null}
                    {index < breadcrumbs.length - 1 ? (
                      <Link
                        to={crumb.to}
                        className="transition hover:text-slate-700"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-900">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden items-center gap-3 rounded-full px-4 md:flex"
              onClick={() => setSearchOpen(true)}
              aria-keyshortcuts="Meta+K Control+K"
            >
              <Search className="size-4" />
              Search
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
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
              <Search className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-full p-0"
              onClick={() =>
                setTheme((current) => (current === "dawn" ? "tide" : "dawn"))
              }
              aria-label="Switch theme"
              aria-pressed={theme === "tide"}
            >
              <Palette className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="relative h-10 w-10 rounded-full p-0"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-amber-400" />
            </Button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      {searchOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/30 px-4 py-12 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
          >
            <div className="flex items-center gap-3">
              <Command className="size-4 text-slate-500" />
              <Input
                ref={searchInputRef}
                placeholder="Search metrics, teammates, and playbooks..."
                className="h-11 border-slate-200/70 bg-white"
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
            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
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
                    className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    type="button"
                  >
                    {item}
                    <ChevronRight className="size-4 text-slate-400" />
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
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link to={item.to}>
          <Icon className="size-4 shrink-0" />
          <span className={cn(collapsed && "sr-only")}>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarBrand() {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-3xl border border-white/70 bg-white/80 px-3 py-3",
        collapsed && "justify-center px-2",
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold uppercase tracking-[0.3em] text-white">
        ss
      </div>
      <div className={cn("flex-1", collapsed && "sr-only")}>
        <p className="text-sm font-semibold text-slate-900">Signal Studio</p>
        <p className="text-xs text-slate-500">Growth Ops</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-9 w-9 rounded-full p-0", collapsed && "hidden")}
        aria-label="Switch team"
      >
        <ChevronsUpDown className="size-4 text-slate-500" />
      </Button>
    </div>
  );
}

function SidebarProfile() {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-3xl border border-white/70 bg-white/80 px-3 py-3",
        collapsed && "justify-center px-2",
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 text-xs font-semibold uppercase text-white">
        ak
      </div>
      <div className={cn("flex-1", collapsed && "sr-only")}>
        <p className="text-sm font-semibold text-slate-900">Avery Keller</p>
        <p className="text-xs text-slate-500">Product Lead</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-9 w-9 rounded-full p-0", collapsed && "hidden")}
        aria-label="Log out"
      >
        <LogOut className="size-4 text-slate-500" />
      </Button>
    </div>
  );
}
