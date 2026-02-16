import { useState } from "react"
import type { UploadFileItem } from "@/packages/hooks-core"
import { Upload } from "@/packages/ui"
import { mockUpload } from "./shared"

export function UploadManualDemo() {
  const [fileList, setFileList] = useState<UploadFileItem<{ url: string; size: number }>[]>([])

  return (
    <div className="space-y-2">
      <Upload
        autoUpload={false}
        fileList={fileList}
        onFileListChange={setFileList}
        onUpload={mockUpload}
        triggerLabel="上传文件（手动开始）"
      />
      <p className="text-xs text-muted-foreground">当前队列：{fileList.length} 个文件</p>
    </div>
  )
}

export default UploadManualDemo
