import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui"

export function TabsBasicDemo() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-lg">
      <TabsList>
        <TabsTrigger value="overview">概览</TabsTrigger>
        <TabsTrigger value="metrics">指标</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="rounded-md border border-border/50 p-3 text-sm">
        这是概览面板内容。
      </TabsContent>
      <TabsContent value="metrics" className="rounded-md border border-border/50 p-3 text-sm">
        这是指标面板内容。
      </TabsContent>
    </Tabs>
  )
}

export default TabsBasicDemo
