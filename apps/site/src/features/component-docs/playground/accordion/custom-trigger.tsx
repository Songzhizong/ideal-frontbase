import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Tag } from "@/packages/ui"

export function AccordionCustomTriggerDemo() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-xl">
      <AccordionItem value="alerts">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            告警规则
            <Tag color="warning" variant="outline">
              3 条待处理
            </Tag>
          </span>
        </AccordionTrigger>
        <AccordionContent>当前有 3 条告警规则未确认，建议按严重级别从高到低处理。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="audit">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            审计日志
            <Tag color="success" variant="outline">
              正常
            </Tag>
          </span>
        </AccordionTrigger>
        <AccordionContent>审计系统运行正常，最近 24 小时无异常中断。</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default AccordionCustomTriggerDemo
