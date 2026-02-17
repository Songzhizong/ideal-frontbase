import { AspectRatio, Image } from "@/packages/ui"

export function AspectRatioMediaCoverDemo() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-md border border-border/50">
      <AspectRatio ratio={16 / 9}>
        <Image
          src="https://picsum.photos/640/360?random=61"
          alt="16:9 预览"
          containerClassName="h-full w-full rounded-none"
        />
      </AspectRatio>
    </div>
  )
}

export default AspectRatioMediaCoverDemo
