import { useEffect, useState } from "react"
import type { CarouselApi } from "@/packages/ui"
import { Button, Carousel, CarouselContent, CarouselItem } from "@/packages/ui"

const slides = ["版本 A", "版本 B", "版本 C", "版本 D"]

export function CarouselControlledApiDemo() {
  const [api, setApi] = useState<CarouselApi>()
  const [index, setIndex] = useState(1)

  useEffect(() => {
    if (!api) {
      return
    }
    setIndex(api.selectedScrollSnap() + 1)

    const handleSelect = () => {
      setIndex(api.selectedScrollSnap() + 1)
    }

    api.on("select", handleSelect)
    return () => {
      api.off("select", handleSelect)
    }
  }, [api])

  return (
    <div className="mx-auto w-full max-w-xl space-y-3">
      <Carousel
        setApi={(nextApi) => {
          setApi(nextApi)
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide}>
              <div className="flex h-36 items-center justify-center rounded-lg border border-border/60 bg-card text-lg font-medium">
                {slide}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          当前：{index} / {slides.length}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => api?.scrollPrev()}>
            上一张
          </Button>
          <Button size="sm" variant="outline" onClick={() => api?.scrollNext()}>
            下一张
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CarouselControlledApiDemo
