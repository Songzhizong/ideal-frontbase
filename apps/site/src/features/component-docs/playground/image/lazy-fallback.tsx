import { Image, ImageLoading } from "@/packages/ui"

export function ImageLazyFallbackDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 md:grid-cols-2">
      <Image
        src="https://picsum.photos/640/360?random=41"
        alt="延迟加载图片"
        lazy
        placeholder={<ImageLoading />}
        containerClassName="h-40 w-full"
      />

      <Image
        src="https://invalid-host.example/image-not-found.png"
        alt="加载失败示例"
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            图片不可用
          </div>
        }
        containerClassName="h-40 w-full"
      />
    </div>
  )
}

export default ImageLazyFallbackDemo
