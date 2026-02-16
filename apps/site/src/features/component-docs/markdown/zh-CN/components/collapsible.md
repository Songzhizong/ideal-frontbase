用于在局部区域按需展开/折叠附加信息，适合“默认隐藏次要内容”的交互。

源码位置：`packages/ui/collapsible.tsx`

## 何时使用

`Collapsible` 适合“主信息常驻、次信息按需展开”的场景。

- 日志详情、错误堆栈的折叠查看
- 设置页中的高级配置区块
- 卡片中的补充说明、历史记录

不建议使用场景：

- 内容之间存在明确流程顺序（建议使用 `Accordion` 或 `Tabs`）

## 代码演示

### 基础用法

```playground
basic
```

### 受控模式

```playground
controlled
```

### 日志详情折叠

```playground
log-detail
```

## 属性说明 (API)

### Collapsible

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控展开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: '非受控初始展开状态。' },
  { name: 'onOpenChange', type: '(open: boolean) => void', default: '-', description: '展开状态变化回调。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用折叠交互。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '折叠容器内容。' }
]"/>

### CollapsibleTrigger

<DataTable preset="props" :data="[
  { name: 'asChild', type: 'boolean', default: 'false', description: '将行为注入自定义触发元素。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用触发器。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '触发器内容。' }
]"/>

### CollapsibleContent

<DataTable preset="props" :data="[
  { name: 'forceMount', type: 'boolean', default: 'false', description: '是否在折叠时仍保持挂载。' },
  { name: 'className', type: 'string', default: '-', description: '内容区样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '折叠内容。' }
]"/>

## A11y

- Trigger 默认维护 `aria-expanded` 与键盘可操作性。
- 展开区域的内容应具备独立可读语义，不建议只放视觉装饰。
- 触发器文案建议明确（如“展开详情”“查看错误日志”）。

## 常见问题 (FAQ)

### 什么时候选 `Collapsible`，什么时候选 `Accordion`？

单块内容展开/收起用 `Collapsible`；多块互斥或多选展开用 `Accordion`。

### 如何让折叠内容在收起时仍保留内部状态？

设置 `forceMount`，避免关闭后卸载导致状态丢失。
