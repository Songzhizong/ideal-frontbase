import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/packages/ui"

const slides = ["发布成功", "灰度进行中", "回滚完成"]

export function CarouselBasicDemo() {
  return (
    <div className="mx-auto w-full max-w-xl px-12">
      <Carousel>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide}>
              <div className="flex h-40 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-lg font-medium">
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

export default CarouselBasicDemo
