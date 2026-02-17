import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/packages/ui"

const MEMBERS = [
  "https://i.pravatar.cc/120?img=1",
  "https://i.pravatar.cc/120?img=5",
  "https://i.pravatar.cc/120?img=11",
  "https://i.pravatar.cc/120?img=19",
]

export function AvatarGroupStackDemo() {
  return (
    <AvatarGroup>
      {MEMBERS.map((src, index) => (
        <Avatar key={src}>
          <AvatarImage src={src} alt={`成员 ${index + 1}`} />
          <AvatarFallback>{index + 1}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+8</AvatarGroupCount>
    </AvatarGroup>
  )
}

export default AvatarGroupStackDemo
