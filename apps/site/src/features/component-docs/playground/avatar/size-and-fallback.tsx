import { Avatar, AvatarFallback, AvatarImage } from "@/packages/ui"

const USERS = [
  { name: "Alex", src: "https://i.pravatar.cc/120?img=12", size: "sm" as const },
  { name: "Bella", src: "https://i.pravatar.cc/120?img=16", size: "default" as const },
  { name: "Chris", src: "https://i.pravatar.cc/120?img=22", size: "lg" as const },
  { name: "Dana", src: "", size: "default" as const },
]

export function AvatarSizeAndFallbackDemo() {
  return (
    <div className="flex items-center gap-3">
      {USERS.map((user) => (
        <Avatar key={`${user.name}-${user.size}`} size={user.size}>
          {user.src ? <AvatarImage src={user.src} alt={user.name} /> : null}
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}

export default AvatarSizeAndFallbackDemo
