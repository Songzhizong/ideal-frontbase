import { LogOut, User } from "lucide-react"
import { useState } from "react"
import { useLogoutHandler } from "@/hooks/use-logout-handler"
import { useAuthStore } from "@/packages/auth-core"
import { BaseLink } from "@/packages/platform-router"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/packages/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/packages/ui/avatar"
import { Button } from "@/packages/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"
import { getAvatarByHash } from "@/packages/ui-utils/avatar-utils"

export function UserMenu() {
  const { handleLogout } = useLogoutHandler()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const user = useAuthStore((state) => state.user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 cursor-pointer rounded-full p-0"
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={getAvatarByHash(user?.userId)} alt="User avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>我的账户</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer transition-colors">
          <BaseLink to="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>个人中心</span>
          </BaseLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => setIsLogoutDialogOpen(true)}
          className="cursor-pointer text-destructive transition-colors focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="w-100">
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出 ?</AlertDialogTitle>
            <AlertDialogDescription>您确定要退出登录吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenu>
  )
}
