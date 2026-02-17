import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/packages/ui"

export function AccordionMultipleDemo() {
  return (
    <Accordion
      type="multiple"
      defaultValue={["filters", "permissions"]}
      className="w-full max-w-xl"
    >
      <AccordionItem value="filters">
        <AccordionTrigger>筛选条件</AccordionTrigger>
        <AccordionContent>支持按状态、标签、更新时间等维度组合筛选。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="permissions">
        <AccordionTrigger>权限说明</AccordionTrigger>
        <AccordionContent>只有管理员可编辑系统级配置，访客仅可查看。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="limits">
        <AccordionTrigger>配额限制</AccordionTrigger>
        <AccordionContent>免费版最多保留 7 天日志，专业版可扩展至 90 天。</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default AccordionMultipleDemo
