import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/packages/ui"

const slides = ["告警大盘", "日志检索", "审计中心"]

export function CarouselVerticalDemo() {
  return (
    <div className="mx-auto h-72 w-full max-w-sm px-12">
      <Carousel orientation="vertical" className="h-full">
        <CarouselContent className="h-full">
          {slides.map((slide) => (
            <CarouselItem key={slide} className="h-full">
              <div className="flex h-full items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-base font-medium">
                {slide}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export default CarouselVerticalDemo
