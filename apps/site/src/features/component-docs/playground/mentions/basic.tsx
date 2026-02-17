import { Mentions } from "@/packages/ui"

const USERS = [
  { value: "alice", label: "Alice" },
  { value: "bob", label: "Bob" },
  { value: "charlie", label: "Charlie" },
]

export function MentionsBasicDemo() {
  return <Mentions className="max-w-lg" rows={4} options={USERS} placeholder="输入 @ 选择协作者" />
}

export default MentionsBasicDemo
