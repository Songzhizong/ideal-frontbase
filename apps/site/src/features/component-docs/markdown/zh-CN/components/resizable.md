用于构建可拖拽调整尺寸的分栏布局，适合编辑器、控制台、双栏详情等场景。

源码位置：`packages/ui/resizable.tsx`

## 何时使用

`Resizable` 适合让用户按需分配可视空间。

- 左右分栏（导航 + 内容）
- 上下分栏（日志 + 详情）
- 三栏工作台（目录 + 编辑区 + 预览）

不建议使用场景：

- 移动端窄屏的主流程页面（拖拽成本高，建议改为切页或抽屉）

## 代码演示

### 水平分栏

```playground
horizontal
```

### 垂直分栏

```playground
vertical
```

### 三栏布局

```playground
three-columns
```

## 属性说明 (API)

### ResizablePanelGroup

<DataTable preset="props" :data="[
  { name: 'direction', type: 'horizontal | vertical', default: '-', description: '分栏方向，必填。' },
  { name: 'autoSaveId', type: 'string', default: '-', description: '启用布局持久化时使用的存储键。' },
  { name: 'onLayout', type: '(sizes: number[]) => void', default: '-', description: '分栏尺寸变化回调。' },
  { name: 'className', type: 'string', default: '-', description: '分栏容器样式扩展。' }
]"/>

### ResizablePanel

<DataTable preset="props" :data="[
  { name: 'defaultSize', type: 'number', default: '-', description: '初始尺寸百分比。' },
  { name: 'minSize', type: 'number', default: '-', description: '最小尺寸百分比。' },
  { name: 'maxSize', type: 'number', default: '-', description: '最大尺寸百分比。' },
  { name: 'collapsible', type: 'boolean', default: 'false', description: '是否允许折叠。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '面板内容。' }
]"/>

### ResizableHandle

<DataTable preset="props" :data="[
  { name: 'withHandle', type: 'boolean', default: 'false', description: '是否显示中间拖拽手柄图标。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用拖拽。' },
  { name: 'className', type: 'string', default: '-', description: '分隔条样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ResizablePanelGroup', value: 'ResizablePrimitive.PanelGroupProps' },
  { name: 'ResizablePanel', value: 'ResizablePrimitive.PanelProps' },
  { name: 'ResizableHandle', value: 'ResizablePrimitive.PanelResizeHandleProps & { withHandle?: boolean }' }
]"/>

## A11y

- 分隔条支持键盘焦点，可通过方向键微调尺寸。
- 拖拽区域尽量保持可点击面积，避免只有 1px 且无可视提示。
- 分栏内容中有表单时，建议限制最小尺寸以免控件被压缩不可用。

## 常见问题 (FAQ)

### 如何记住用户上次调整后的分栏比例？

给 `ResizablePanelGroup` 设置 `autoSaveId`，组件会自动持久化布局。

### 什么时候需要 `withHandle`？

当布局面向新手或需要强化“可拖拽”提示时建议开启；高密度界面可关闭以减少视觉噪声。
