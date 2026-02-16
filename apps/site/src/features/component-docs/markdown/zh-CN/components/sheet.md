用于通用侧滑/上下滑面板，支持四个方向和可选关闭按钮。

源码位置：`packages/ui/sheet.tsx`

## 何时使用

`Sheet` 适合临时面板型任务，不打断主页面结构。

- 侧边筛选器
- 配置编辑面板
- 顶部/底部通知面板

不建议使用场景：

- 强流程确认场景（建议使用 `AlertDialog`）

## 代码演示

### 右侧 Sheet

```playground
basic-right
```

### 左侧面板

```playground
left-panel
```

### 顶部/底部方向

```playground
top-bottom
```

## 属性说明 (API)

### Sheet

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: '-', description: '非受控初始状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '打开状态回调。' },
  { name: 'modal', type: 'boolean', default: 'true', description: '是否模态行为。' }
]"/>

### SheetContent

<DataTable preset="props" :data="[
  { name: 'side', type: 'top | right | bottom | left', default: 'right', description: '面板方向。' },
  { name: 'showCloseButton', type: 'boolean', default: 'true', description: '是否显示右上角关闭按钮。' },
  { name: 'className', type: 'string', default: '-', description: '内容样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '面板内容。' }
]"/>

### 结构组件

<DataTable preset="props" :data="[
  { name: 'SheetHeader/Footer', type: '-', default: '-', description: '头尾布局容器。' },
  { name: 'SheetTitle/Description', type: '-', default: '-', description: '标题和描述文案。' },
  { name: 'SheetTrigger/SheetClose', type: '-', default: '-', description: '打开与关闭触发器。' }
]"/>

## FAQ

### 如何隐藏关闭按钮并自定义页脚按钮？

`SheetContent` 传 `showCloseButton={false}`，再在内容中自己放按钮。

### 如何控制宽度？

通过 `className` 覆盖默认宽度类（如 `sm:max-w-md`）。
