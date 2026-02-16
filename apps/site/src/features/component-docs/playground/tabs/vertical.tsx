import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui"

export function TabsVerticalDemo() {
  return (
    <Tabs orientation="vertical" defaultValue="profile" className="max-w-xl">
      <TabsList>
        <TabsTrigger value="profile">个人信息</TabsTrigger>
        <TabsTrigger value="security">安全设置</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="rounded-md border border-border/50 p-3 text-sm">
        编辑昵称、头像和简介。
      </TabsContent>
      <TabsContent value="security" className="rounded-md border border-border/50 p-3 text-sm">
        管理密码和二次验证。
      </TabsContent>
    </Tabs>
  )
}

export default TabsVerticalDemo
