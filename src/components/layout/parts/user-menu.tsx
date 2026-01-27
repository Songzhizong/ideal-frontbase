import { LogOut, Monitor, Moon, Sun, User } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
	const { theme, setTheme } = useTheme()

	const handleLogout = () => {
		// TODO: 实现退出登录逻辑
		console.log("退出登录")
	}

	const handleProfileClick = () => {
		// TODO: 跳转到个人中心页面
		console.log("跳转到个人中心")
	}

	const themeOptions = [
		{ value: "light", label: "浅色模式", icon: Sun },
		{ value: "dark", label: "深色模式", icon: Moon },
		{ value: "system", label: "跟随系统", icon: Monitor },
	] as const

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="relative h-10 w-10 rounded-full p-0"
					aria-label="User menu"
				>
					<Avatar className="h-9 w-9">
						<AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>我的账户</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleProfileClick}>
					<User className="mr-2 h-4 w-4" />
					<span>个人中心</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
					主题模式
				</DropdownMenuLabel>
				{themeOptions.map((option) => {
					const Icon = option.icon
					return (
						<DropdownMenuItem
							key={option.value}
							onClick={() => setTheme(option.value)}
							className={theme === option.value ? "bg-accent" : ""}
						>
							<Icon className="mr-2 h-4 w-4" />
							<span>{option.label}</span>
						</DropdownMenuItem>
					)
				})}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleLogout}
					className="text-destructive focus:text-destructive"
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>退出登录</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
