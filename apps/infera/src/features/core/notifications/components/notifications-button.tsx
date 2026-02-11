import { Bell } from "lucide-react"
import { Button } from "@/packages/ui/button"

export function NotificationsButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative h-10 w-10 cursor-pointer rounded-full p-0"
      aria-label="Notifications"
    >
      <Bell className="size-4" />
      <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-warning" />
    </Button>
  )
}
