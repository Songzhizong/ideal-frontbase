用于承载通用模态内容，支持表单、说明文案和自定义页脚操作。

源码位置：`packages/ui/dialog.tsx`

## 何时使用

`Dialog` 适合需要暂时聚焦处理的任务窗口。

- 配置编辑
- 信息补录
- 次级任务流处理

不建议使用场景：

- 大段滚动内容阅读（可考虑独立页面或 `Drawer`）

## 代码演示

### 基础弹窗

```playground
basic
```

### 受控模式

```playground
controlled
```

### 表单内容

```playground
form-content
```

## 属性说明 (API)

### Dialog

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: '-', description: '非受控初始状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '打开状态变化回调。' },
  { name: 'modal', type: 'boolean', default: 'true', description: '是否启用模态行为。' }
]"/>

### DialogContent

<DataTable preset="props" :data="[
  { name: 'showCloseButton', type: 'boolean', default: 'true', description: '是否显示右上角关闭按钮。' },
  { name: 'className', type: 'string', default: '-', description: '内容容器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '弹窗主体内容。' }
]"/>

### DialogFooter

<DataTable preset="props" :data="[
  { name: 'showCloseButton', type: 'boolean', default: 'false', description: '是否自动渲染关闭按钮。' },
  { name: 'className', type: 'string', default: '-', description: '页脚样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '页脚按钮区内容。' }
]"/>

### 结构组件

<DataTable preset="props" :data="[
  { name: 'DialogHeader/Title/Description', type: '-', default: '-', description: '标题区结构。' },
  { name: 'DialogTrigger/DialogClose', type: '-', default: '-', description: '打开和关闭触发器。' },
  { name: 'DialogOverlay/DialogPortal', type: '-', default: '-', description: '遮罩与 portal 容器。' }
]"/>

## FAQ

### `Dialog` 和 `AlertDialog` 区别？

`Dialog` 面向通用内容承载，`AlertDialog` 面向高风险确认。

### 如何隐藏右上角关闭按钮？

在 `DialogContent` 传 `showCloseButton={false}`。
