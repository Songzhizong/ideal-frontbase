import { Image } from "@/packages/ui"

export function ImageBasicDemo() {
  return (
    <Image
      src="https://picsum.photos/640/360?random=11"
      alt="产品封面"
      containerClassName="h-48 w-full max-w-md"
    />
  )
}

export default ImageBasicDemo
