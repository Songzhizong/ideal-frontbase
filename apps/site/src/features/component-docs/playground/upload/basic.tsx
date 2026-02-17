import { Upload } from "@/packages/ui"
import { mockUpload } from "./shared"

export function UploadBasicDemo() {
  return (
    <Upload
      accept="image/*,.pdf"
      maxSize={4 * 1024 * 1024}
      maxCount={3}
      onUpload={mockUpload}
      triggerLabel="上传文件（自动）"
    />
  )
}

export default UploadBasicDemo
