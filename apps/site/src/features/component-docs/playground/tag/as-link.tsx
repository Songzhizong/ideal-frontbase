import { Tag } from "@/packages/ui"

export function TagAsLinkDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag asChild variant="link">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          查看发布日志
        </a>
      </Tag>
      <Tag asChild variant="outline">
        <a href="https://pnpm.io" target="_blank" rel="noopener noreferrer">
          依赖升级提示
        </a>
      </Tag>
    </div>
  )
}

export default TagAsLinkDemo
