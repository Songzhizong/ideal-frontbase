import { Tag, tagSizeOptions } from "@/packages/ui"

export function TagSizeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tagSizeOptions.map((size) => (
        <Tag key={size} size={size} variant="solid" color="secondary">
          {size}
        </Tag>
      ))}
    </div>
  )
}

export default TagSizeDemo
