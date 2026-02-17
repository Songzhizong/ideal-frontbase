import { UploadDragger } from "@/packages/ui"
import { mockUpload } from "./shared"

export function UploadDraggerDemo() {
  return (
    <UploadDragger
      multiple
      accept=".json,.yaml,.yml"
      maxCount={5}
      onUpload={mockUpload}
      title="拖拽配置文件到这里"
      description="支持 JSON / YAML，单文件不超过 4MB"
    />
  )
}

export default UploadDraggerDemo
