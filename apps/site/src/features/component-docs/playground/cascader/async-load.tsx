import { useState } from "react"
import type { CascaderOption, CascaderSingleValue } from "@/packages/ui"
import { Cascader } from "@/packages/ui"

const rootOptions: CascaderOption[] = [
  { value: "asia", label: "亚洲", isLeaf: false },
  { value: "europe", label: "欧洲", isLeaf: false },
]

const childrenMap: Record<string, CascaderOption[]> = {
  asia: [
    { value: "china", label: "中国", isLeaf: false },
    { value: "japan", label: "日本", isLeaf: true },
  ],
  europe: [
    { value: "france", label: "法国", isLeaf: true },
    { value: "germany", label: "德国", isLeaf: true },
  ],
  "asia/china": [
    { value: "shanghai", label: "上海", isLeaf: true },
    { value: "beijing", label: "北京", isLeaf: true },
  ],
}

export function CascaderAsyncLoadDemo() {
  const [value, setValue] = useState<CascaderSingleValue | undefined>()

  return (
    <div className="w-full max-w-lg space-y-2">
      <Cascader
        options={rootOptions}
        value={value}
        onChange={(nextValue: CascaderSingleValue | undefined) => setValue(nextValue)}
        loadData={async (selectedOptions) => {
          const key = selectedOptions.map((item) => item.value).join("/")
          await new Promise((resolve) => window.setTimeout(resolve, 400))
          return childrenMap[key] ?? []
        }}
      />
      <p className="text-xs text-muted-foreground">当前路径：{value?.join(" / ") ?? "未选择"}</p>
    </div>
  )
}

export default CascaderAsyncLoadDemo
