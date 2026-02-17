import {
  BookOpenIcon,
  BotIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  GalleryVerticalEndIcon,
  SquareTerminalIcon,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/packages/ui"

export function SidebarBasicLayoutDemo() {
  return (
    <SidebarProvider className="min-h-0">
      <div className="w-full space-y-4">
        <div className="relative isolate flex h-140 w-full overflow-hidden rounded-3xl border border-border/50 bg-background">
          <Sidebar className="absolute!" collapsible="icon">
            <SidebarHeader className="border-border/50 border-b p-3">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" className="h-14 px-3">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      <GalleryVerticalEndIcon className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Acme Inc</span>
                      <span className="truncate text-xs">Enterprise</span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup className="px-3 py-2">
                <SidebarGroupLabel className="px-2 text-sm">Platform</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <SquareTerminalIcon />
                        <span>Playground</span>
                        <ChevronRightIcon className="ml-auto size-4" />
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <button type="button">History</button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <button type="button">Starred</button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <button type="button">Settings</button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <BotIcon />
                        <span>Models</span>
                        <ChevronRightIcon className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <BookOpenIcon />
                        <span>Documentation</span>
                        <ChevronRightIcon className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-border/50 border-t p-3">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" className="h-14 px-3">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">SC</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">shadcn</span>
                      <span className="truncate text-xs">m@example.com</span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="min-h-0">
            <header className="border-border/50 flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4" />
          </SidebarInset>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          A sidebar that collapses to icons.
        </p>
      </div>
    </SidebarProvider>
  )
}

export default SidebarBasicLayoutDemo
