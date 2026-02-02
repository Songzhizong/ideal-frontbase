import { Activity, ClipboardList, Menu, Shield, User } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUserProfile } from "@/features/auth/api/get-current-user"
// Import settings components
import {
	ActiveSessionsSettings,
	AdvancedSettings,
	LogRecordsSettings,
	PreferencesSettings,
	SecuritySettings,
} from "@/features/profile"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import { GeneralSettings } from "./general-settings"

const navItems = [
	{ value: "general", label: "通用", icon: User },
	{ value: "security", label: "安全", icon: Shield },
	{ value: "sessions", label: "活跃会话", icon: Activity },
	{ value: "logs", label: "日志记录", icon: ClipboardList },
	// { value: "preferences", label: "偏好", icon: Settings },
	// { value: "advanced", label: "其他", icon: MoreHorizontal },
] as const

export function ProfileLayout() {
	const [tab, setTab] = useQueryState("tab", { defaultValue: "general" })
	const [open, setOpen] = useState(false)
	const setUser = useAuthStore((state) => state.setUser)
	const { data: userProfile } = useUserProfile()

	// 同步用户信息到 Store
	useEffect(() => {
		if (userProfile) {
			setUser(userProfile)
		}
	}, [userProfile, setUser])

	const NavLinks = () => (
		<>
			{navItems.map((item) => {
				const Icon = item.icon
				const isActive = tab === item.value

				return (
					<button
						key={item.value}
						type="button"
						onClick={() => {
							void setTab(item.value)
							setOpen(false)
						}}
						className={cn(
							"flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
							isActive
								? "bg-secondary font-medium text-foreground"
								: "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
						)}
					>
						<Icon className="size-4" />
						<span>{item.label}</span>
					</button>
				)
			})}
		</>
	)

	return (
		<div className="bg-background h-full overflow-hidden">
			<div className="mx-auto max-w-6xl px-4 py-6 h-full flex flex-col overflow-hidden">
				{/* Main Grid */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-[160px_1fr] flex-1 min-h-0 overflow-hidden">
					{/* Desktop Sidebar */}
					<aside className="hidden md:block">
						<nav className="space-y-1">
							<NavLinks />
						</nav>
					</aside>

					{/* Mobile Navigation */}
					<div className="mb-4 md:hidden shrink-0">
						<Sheet open={open} onOpenChange={setOpen}>
							<SheetTrigger asChild>
								<Button variant="outline" size="sm" className="w-full justify-start">
									<Menu className="mr-2 size-4" />
									菜单
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-64">
								<nav className="mt-8 space-y-1">
									<NavLinks />
								</nav>
							</SheetContent>
						</Sheet>
					</div>

					{/* Content Area */}
					<main className="min-w-0 flex flex-col h-full overflow-y-auto scrollbar-thin">
						{tab === "general" && <GeneralSettings />}
						{tab === "security" && <SecuritySettings />}
						{tab === "sessions" && <ActiveSessionsSettings />}
						{tab === "logs" && <LogRecordsSettings />}
						{tab === "preferences" && <PreferencesSettings />}
						{tab === "advanced" && <AdvancedSettings />}
					</main>
				</div>
			</div>
		</div>
	)
}
