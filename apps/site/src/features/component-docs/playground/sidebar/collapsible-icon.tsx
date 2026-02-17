import { BellIcon, FolderIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/packages/ui"

export function SidebarCollapsibleIconDemo() {
  return (
    <SidebarProvider className="min-h-0">
      <div className="relative isolate flex min-h-72 w-full overflow-hidden rounded-md border border-border/50">
        <Sidebar className="absolute!" collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="通知中心">
                      <BellIcon />
                      <span>通知中心</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="项目文件">
                      <FolderIcon />
                      <span>项目文件</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col p-3">
          <SidebarTrigger className="mb-3" />
          <p className="text-sm text-muted-foreground">点击按钮切换 icon 折叠模式。</p>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default SidebarCollapsibleIconDemo
