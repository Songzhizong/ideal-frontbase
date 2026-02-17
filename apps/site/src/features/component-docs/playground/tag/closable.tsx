import { useState } from "react"
import { Tag } from "@/packages/ui"

export function TagClosableDemo() {
  const [items, setItems] = useState(["Alpha", "Beta", "Gamma"])

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Tag
          key={item}
          closable
          color="primary"
          variant="soft"
          onClose={() => {
            setItems((prev) => prev.filter((name) => name !== item))
          }}
        >
          {item}
        </Tag>
      ))}
      {items.length === 0 ? (
        <Tag
          color="success"
          variant="soft"
          onClick={() => {
            setItems(["Alpha", "Beta", "Gamma"])
          }}
          className="cursor-pointer"
        >
          重置
        </Tag>
      ) : null}
    </div>
  )
}

export default TagClosableDemo
