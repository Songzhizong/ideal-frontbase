import { ShieldCheckIcon } from "lucide-react"
import { Result } from "@/packages/ui"

export function ResultCustomIconDemo() {
  return (
    <Result
      status="info"
      icon={<ShieldCheckIcon aria-hidden className="size-8 text-success" />}
      title="安全扫描通过"
      subtitle="本次构建未发现高危漏洞，已满足发布条件。"
    />
  )
}

export default ResultCustomIconDemo
