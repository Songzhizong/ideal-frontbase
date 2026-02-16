import { Badge } from "@/packages/ui"

export function BadgeAsLinkDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge asChild variant="link">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          查看发布日志
        </a>
      </Badge>
      <Badge asChild variant="outline">
        <a href="https://pnpm.io" target="_blank" rel="noopener noreferrer">
          依赖升级提示
        </a>
      </Badge>
    </div>
  )
}

export default BadgeAsLinkDemo
