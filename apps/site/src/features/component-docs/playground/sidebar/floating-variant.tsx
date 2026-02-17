import { FileTextIcon, UsersIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/packages/ui"

export function SidebarFloatingVariantDemo() {
  return (
    <SidebarProvider className="min-h-0">
      <div className="relative isolate flex min-h-72 w-full overflow-hidden rounded-md border border-border/50 bg-muted/20">
        <Sidebar className="absolute!" variant="floating" collapsible="offcanvas">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>团队</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <UsersIcon />
                      <span>成员管理</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FileTextIcon />
                      <span>审计日志</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="p-3">
          <p className="text-sm text-muted-foreground">
            floating 变体会在侧栏外层添加间距与圆角效果。
          </p>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default SidebarFloatingVariantDemo
