export interface ComponentDemoItem {
  slug: string
  menuTitle: string
  name: string
  purpose: string
  scenarios: readonly string[]
}

export const COMPONENT_DEMOS = [
  {
    slug: "copy",
    menuTitle: "Copy",
    name: "Copy",
    purpose: "提供一键复制文本能力，支持复制结果反馈与可访问交互。",
    scenarios: ["复制密钥/URL", "复制命令片段", "详情页字段快速复制"],
  },
  {
    slug: "description-list",
    menuTitle: "DescriptionList",
    name: "DescriptionList",
    purpose: "用于成组展示标签-值结构化信息，提升详情阅读效率。",
    scenarios: ["资源详情页", "配置概览", "审核单据摘要"],
  },
  {
    slug: "statistic",
    menuTitle: "Statistic",
    name: "Statistic",
    purpose: "聚焦单个指标值展示，支持趋势、前后缀与数字格式化。",
    scenarios: ["运营指标", "实时数据监控", "卡片内关键数字"],
  },
  {
    slug: "stat-card",
    menuTitle: "StatCard",
    name: "StatCard",
    purpose: "在卡片容器内展示指标，适合用于 Dashboard 指标矩阵。",
    scenarios: ["首页总览", "项目健康度面板", "业务看板 KPI"],
  },
  {
    slug: "result",
    menuTitle: "Result",
    name: "Result",
    purpose: "统一成功/失败/告警/信息等结果态，减少状态页样式分歧。",
    scenarios: ["操作完成页", "空结果替代视图", "权限/异常提示"],
  },
  {
    slug: "upload",
    menuTitle: "Upload",
    name: "Upload",
    purpose: "提供按钮上传和拖拽上传，支持进度、失败重试与校验。",
    scenarios: ["文件导入", "模型/数据上传", "批量资源投递"],
  },
  {
    slug: "steps",
    menuTitle: "Steps",
    name: "Steps",
    purpose: "展示流程阶段与当前进度，帮助用户明确所处步骤。",
    scenarios: ["配置流程", "审批流程", "任务进度标识"],
  },
  {
    slug: "wizard",
    menuTitle: "Wizard",
    name: "Wizard",
    purpose: "封装多步骤向导流程，内置上下步切换、校验与完成回调。",
    scenarios: ["创建向导", "复杂表单分步提交", "新手流程引导"],
  },
  {
    slug: "timeline",
    menuTitle: "Timeline",
    name: "Timeline",
    purpose: "按时间顺序展示事件与状态，支持左右或交替布局。",
    scenarios: ["审计日志", "发布记录", "工单处理轨迹"],
  },
  {
    slug: "tree",
    menuTitle: "Tree",
    name: "Tree",
    purpose: "展示层级结构数据，支持展开、勾选、拖拽与虚拟滚动。",
    scenarios: ["资源目录", "权限节点管理", "分类层级维护"],
  },
  {
    slug: "tree-select",
    menuTitle: "TreeSelect",
    name: "TreeSelect",
    purpose: "在选择器中承载树形数据，支持搜索与多选标签。",
    scenarios: ["组织/部门选择", "多层分类筛选", "资源树节点选择"],
  },
  {
    slug: "cascader",
    menuTitle: "Cascader",
    name: "Cascader",
    purpose: "用于多级级联选择，支持路径检索与按层级逐步选择。",
    scenarios: ["地域-机房-集群选择", "业务域层级选择", "分类路径定位"],
  },
  {
    slug: "transfer",
    menuTitle: "Transfer",
    name: "Transfer",
    purpose: "通过双栏穿梭完成候选项到目标项的批量迁移。",
    scenarios: ["成员分配", "权限分组配置", "服务绑定对象"],
  },
  {
    slug: "image",
    menuTitle: "Image",
    name: "Image",
    purpose: "增强图片展示能力，支持懒加载、失败兜底与预览。",
    scenarios: ["媒体资产展示", "封面/缩略图预览", "大图查看"],
  },
  {
    slug: "tag-input",
    menuTitle: "TagInput",
    name: "TagInput",
    purpose: "将文本输入拆分为标签集合，支持分隔符、校验与粘贴导入。",
    scenarios: ["标签管理", "关键字录入", "批量字符串输入"],
  },
  {
    slug: "skeleton-presets",
    menuTitle: "SkeletonPreset",
    name: "Skeleton 页面预设",
    purpose: "提供表格/卡片/表单/详情级骨架屏，统一加载占位体验。",
    scenarios: ["接口加载阶段", "首屏渐进渲染", "异步区块占位"],
  },
  {
    slug: "anchor",
    menuTitle: "Anchor",
    name: "Anchor",
    purpose: "为长页面提供锚点导航与滚动定位，提升文档型页面可用性。",
    scenarios: ["帮助中心", "配置文档页", "长表单章节跳转"],
  },
  {
    slug: "back-top",
    menuTitle: "BackTop",
    name: "BackTop",
    purpose: "滚动到阈值后显示返回顶部按钮，降低长页面回溯成本。",
    scenarios: ["日志列表", "报表页面", "长文档页面"],
  },
  {
    slug: "tour",
    menuTitle: "Tour",
    name: "Tour",
    purpose: "分步骤引导用户了解界面关键区域和操作路径。",
    scenarios: ["新手引导", "功能上线导览", "复杂页面教学"],
  },
  {
    slug: "watermark",
    menuTitle: "Watermark",
    name: "Watermark",
    purpose: "在内容区域叠加文字/图片水印，用于数据归属与防外泄标识。",
    scenarios: ["截图溯源", "敏感页面标记", "导出内容标识"],
  },
  {
    slug: "qr-code",
    menuTitle: "QRCode",
    name: "QRCode",
    purpose: "生成二维码并支持状态控制、嵌入图标及下载。",
    scenarios: ["分享链接", "登录绑定", "设备配对"],
  },
  {
    slug: "mentions",
    menuTitle: "Mentions",
    name: "Mentions",
    purpose: "在文本输入中提供 @ 提及能力，支持搜索候选项。",
    scenarios: ["评论协作", "工单指派", "消息提醒"],
  },
  {
    slug: "rate",
    menuTitle: "Rate",
    name: "Rate",
    purpose: "提供星级评分输入组件，支持半星与键盘操作。",
    scenarios: ["服务评价", "体验反馈", "满意度采集"],
  },
  {
    slug: "color-picker",
    menuTitle: "ColorPicker",
    name: "ColorPicker",
    purpose: "用于颜色选择与预设色切换，支持手动输入色值。",
    scenarios: ["主题色配置", "标签色设置", "可视化样式编辑"],
  },
] as const satisfies readonly ComponentDemoItem[]

export type ComponentDemoSlug = (typeof COMPONENT_DEMOS)[number]["slug"]

const COMPONENT_DEMO_BY_SLUG = new Map<string, ComponentDemoItem>(
  COMPONENT_DEMOS.map((item) => [item.slug, item]),
)

export function getComponentDemoBySlug(slug: string) {
  return COMPONENT_DEMO_BY_SLUG.get(slug)
}

export function isComponentDemoSlug(slug: string): slug is ComponentDemoSlug {
  return COMPONENT_DEMO_BY_SLUG.has(slug)
}
