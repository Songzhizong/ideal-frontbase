import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/packages/ui"

export function AccordionBasicDemo() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full max-w-xl rounded-md border border-border/60 px-4"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>如何创建组件文档？</AccordionTrigger>
        <AccordionContent>
          在 `markdown/zh-CN/components` 新建对应 slug 的 `.md` 文件，并在 playground 目录添加示例。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>API 表格如何渲染？</AccordionTrigger>
        <AccordionContent>
          使用 DataTable 的 `preset=\"props\"` 并保证 `:data` 传入字面量数组。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>如何保证可维护性？</AccordionTrigger>
        <AccordionContent>
          每个组件至少提供基础示例和业务示例，并同步更新 checklist 状态。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default AccordionBasicDemo
