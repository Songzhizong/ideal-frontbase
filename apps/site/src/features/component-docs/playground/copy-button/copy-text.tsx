import { CopyText } from "@/packages/ui"

export function CopyButtonCopyTextDemo() {
  return (
    <div className="w-full max-w-xl space-y-3">
      <CopyText
        value="https://api.example.com/v1/projects/alpha/metrics?range=7d"
        className="max-w-sm"
      />
      <CopyText
        value="POST /v1/chat/completions"
        text="命令：POST /v1/chat/completions"
        truncate={false}
        className="max-w-sm"
      />
    </div>
  )
}

export default CopyButtonCopyTextDemo
