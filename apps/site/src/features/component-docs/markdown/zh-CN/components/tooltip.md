用于展示简短辅助说明，适合按钮图标、状态标识等轻量提示场景。

源码位置：`packages/ui/tooltip.tsx`

## 何时使用

`Tooltip` 适合补充“短、轻、非关键”的解释信息。

- 图标按钮语义说明
- 截断文本补充提示
- 禁用功能原因提示

不建议使用场景：

- 承载表单、按钮等复杂交互内容（建议用 `Popover`）

## 代码演示

### 基础提示

```playground
basic
```

### 方向示例

```playground
positions
```

### Provider 延迟控制

```playground
delay-provider
```

## 属性说明 (API)

### TooltipProvider

<DataTable preset="props" :data="[
  { name: 'delayDuration', type: 'number', default: '0', description: '显示延迟（毫秒）。' },
  { name: 'skipDelayDuration', type: 'number', default: '-', description: '连续切换提示的跳过延迟。' },
  { name: 'disableHoverableContent', type: 'boolean', default: '-', description: '是否禁用 hover 内容区保持。' }
]"/>

### Tooltip

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: '-', description: '非受控初始状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '打开状态回调。' }
]"/>

### TooltipContent

<DataTable preset="props" :data="[
  { name: 'side', type: 'top | right | bottom | left', default: 'top', description: '提示方向。' },
  { name: 'sideOffset', type: 'number', default: '0', description: '偏移距离。' },
  { name: 'className', type: 'string', default: '-', description: '内容样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '提示内容。' }
]"/>

## FAQ

### Tooltip 为什么有时不显示？

确认触发元素未被禁用；禁用按钮原生不触发 hover/focus，可包一层可交互容器。

### 如何统一修改页面 Tooltip 延迟？

在上层使用 `TooltipProvider` 统一配置 `delayDuration`。
