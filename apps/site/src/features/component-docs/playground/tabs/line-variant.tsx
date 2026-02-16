import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui"

export function TabsLineVariantDemo() {
  return (
    <Tabs defaultValue="draft" className="w-full max-w-lg">
      <TabsList variant="line">
        <TabsTrigger value="draft">草稿</TabsTrigger>
        <TabsTrigger value="review">评审中</TabsTrigger>
        <TabsTrigger value="published">已发布</TabsTrigger>
      </TabsList>
      <TabsContent value="draft" className="pt-2 text-sm text-muted-foreground">
        共 12 篇草稿待编辑。
      </TabsContent>
      <TabsContent value="review" className="pt-2 text-sm text-muted-foreground">
        共 3 篇文章待评审。
      </TabsContent>
      <TabsContent value="published" className="pt-2 text-sm text-muted-foreground">
        共 58 篇已发布内容。
      </TabsContent>
    </Tabs>
  )
}

export default TabsLineVariantDemo
