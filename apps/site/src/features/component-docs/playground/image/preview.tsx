import { Image } from "@/packages/ui"

export function ImagePreviewDemo() {
  return (
    <Image
      src="https://picsum.photos/640/360?random=21"
      alt="点击放大预览"
      preview
      containerClassName="h-48 w-full max-w-md"
    />
  )
}

export default ImagePreviewDemo
