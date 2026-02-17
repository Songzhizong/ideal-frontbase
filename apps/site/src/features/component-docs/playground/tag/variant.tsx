import { Tag, tagVariantOptions } from "@/packages/ui"

export function TagVariantDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tagVariantOptions.map((variant) => (
        <Tag key={variant} variant={variant} color="primary">
          {variant}
        </Tag>
      ))}
    </div>
  )
}

export default TagVariantDemo
