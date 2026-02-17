import { Tag, tagColorOptions } from "@/packages/ui"

export function TagColorDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tagColorOptions.map((color) => (
        <Tag key={color} color={color} variant="soft">
          {color}
        </Tag>
      ))}
    </div>
  )
}

export default TagColorDemo
