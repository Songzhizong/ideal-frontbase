import { Grid2X2CheckIcon } from "lucide-react"
import { ContentLayout } from "@/packages/layout-core"
import { Badge } from "@/packages/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import { Result } from "@/packages/ui/result"
import {
  type ComponentDemoItem,
  type ComponentDemoSlug,
  getComponentDemoBySlug,
  isComponentDemoSlug,
} from "./component-demo-config"
import { ComponentDemoPreview } from "./component-demo-preview"

interface ComponentShowcasePageProps {
  componentId: string
}

function ScenarioList({ scenarios }: { scenarios: readonly string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
      {scenarios.map((scenario) => (
        <li key={scenario}>{scenario}</li>
      ))}
    </ul>
  )
}

function getDemoByComponentId(componentId: string): ComponentDemoItem | null {
  if (!isComponentDemoSlug(componentId)) {
    return null
  }

  return getComponentDemoBySlug(componentId) ?? null
}

export function ComponentShowcasePage({ componentId }: ComponentShowcasePageProps) {
  const componentDemo = getDemoByComponentId(componentId)

  if (!componentDemo) {
    return (
      <ContentLayout
        title="组件示例"
        description="未找到对应的组件示例页面，请通过左侧菜单选择有效组件。"
      >
        <Result
          status="404"
          title="组件示例不存在"
          subtitle={`当前路径组件标识为：${componentId}`}
        />
      </ContentLayout>
    )
  }

  const slug = componentDemo.slug as ComponentDemoSlug

  return (
    <ContentLayout
      title={`${componentDemo.name} 组件示例`}
      description="本页面用于快速理解组件定位、适用场景和基础展示效果。"
      actions={
        <Badge variant="outline" className="gap-1">
          <Grid2X2CheckIcon className="size-3.5" aria-hidden />
          组件标识：{componentDemo.slug}
        </Badge>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>组件是做什么的</CardTitle>
            <CardDescription>定位说明</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{componentDemo.purpose}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>适用场景</CardTitle>
            <CardDescription>推荐落地场景</CardDescription>
          </CardHeader>
          <CardContent>
            <ScenarioList scenarios={componentDemo.scenarios} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>组件预览</CardTitle>
          <CardDescription>至少包含一个可见效果，便于快速评估展示形态</CardDescription>
        </CardHeader>
        <CardContent>
          <ComponentDemoPreview slug={slug} />
        </CardContent>
      </Card>
    </ContentLayout>
  )
}
