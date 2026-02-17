import { ScrollArea } from "@/packages/ui"

const rows = Array.from({ length: 16 }, (_, rowIndex) =>
  Array.from({ length: 8 }, (_, colIndex) => `R${rowIndex + 1}-C${colIndex + 1}`),
)

export function ScrollAreaBothAxesDemo() {
  return (
    <ScrollArea
      className="h-60 w-full max-w-xl rounded-md border border-border/60"
      scrollbars="both"
    >
      <div className="min-w-[760px] p-3">
        <div className="grid grid-cols-8 gap-2 text-xs">
          {rows.flatMap((cols, rowIndex) =>
            cols.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="rounded border border-border/60 bg-background px-2 py-1 text-center"
              >
                {cell}
              </div>
            )),
          )}
        </div>
      </div>
    </ScrollArea>
  )
}

export default ScrollAreaBothAxesDemo
