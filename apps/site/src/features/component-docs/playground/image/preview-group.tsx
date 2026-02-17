import { Image, ImagePreviewGroup } from "@/packages/ui"

const SOURCES = [
  "https://picsum.photos/640/360?random=31",
  "https://picsum.photos/640/360?random=32",
  "https://picsum.photos/640/360?random=33",
]

export function ImagePreviewGroupDemo() {
  return (
    <ImagePreviewGroup className="grid w-full max-w-2xl gap-3 md:grid-cols-3">
      {SOURCES.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`图库图片 ${index + 1}`}
          preview
          containerClassName="h-36 w-full"
        />
      ))}
    </ImagePreviewGroup>
  )
}

export default ImagePreviewGroupDemo
