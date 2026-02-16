import { type MentionOption, Mentions } from "@/packages/ui"

const MEMBERS: MentionOption[] = [
  { value: "frontend", label: "前端团队", keywords: ["react", "ui"] },
  { value: "backend", label: "后端团队", keywords: ["api", "service"] },
  { value: "qa", label: "测试团队", keywords: ["test", "qa"] },
]

export function MentionsCustomRenderDemo() {
  return (
    <Mentions
      className="max-w-lg"
      trigger="#"
      rows={4}
      options={MEMBERS}
      placeholder="输入 # 选择团队"
      renderOption={(option, active) => (
        <div className="flex w-full items-center justify-between gap-3">
          <span className="truncate">{option.label ?? option.value}</span>
          <span className={active ? "text-accent-foreground" : "text-muted-foreground"}>
            #{option.value}
          </span>
        </div>
      )}
    />
  )
}

export default MentionsCustomRenderDemo
