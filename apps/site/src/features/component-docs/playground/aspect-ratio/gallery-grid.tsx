import { AspectRatio, Image } from "@/packages/ui"

const IMAGES = [
  { ratio: 1, src: "https://picsum.photos/400/400?random=71", label: "1:1" },
  { ratio: 4 / 3, src: "https://picsum.photos/400/300?random=72", label: "4:3" },
  { ratio: 3 / 4, src: "https://picsum.photos/300/400?random=73", label: "3:4" },
]

export function AspectRatioGalleryGridDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 md:grid-cols-3">
      {IMAGES.map((item) => (
        <div key={item.label} className="space-y-1">
          <AspectRatio ratio={item.ratio}>
            <Image src={item.src} alt={item.label} containerClassName="h-full w-full" />
          </AspectRatio>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

export default AspectRatioGalleryGridDemo
