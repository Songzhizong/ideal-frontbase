用于构建命令面板（Command Palette），支持搜索过滤、键盘导航和分组快捷操作。

源码位置：`packages/ui/command.tsx`

## 何时使用

`Command` 适合“快速执行动作”与“统一入口导航”。

- 全局命令面板（如 `⌘K`）
- 成员选择、字段搜索、动作检索
- 高频操作的键盘优先交互

不建议使用场景：

- 选项很少且无需搜索（建议用 `DropdownMenu` / `Select`）

## 代码演示

### 内联命令面板

```playground
basic
```

### 弹窗命令面板

```playground
dialog
```

### 分组与快捷键

```playground
grouped-actions
```

## 属性说明 (API)

### Command

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '受控搜索值。' },
  { name: 'onValueChange', type: '(value: string) => void', default: '-', description: '搜索值变化回调。' },
  { name: 'filter', type: '(value, search, keywords?) => number', default: '-', description: '自定义过滤算法。' },
  { name: 'loop', type: 'boolean', default: 'false', description: '键盘导航是否循环。' },
  { name: 'className', type: 'string', default: '-', description: '面板样式扩展。' }
]"/>

### CommandDialog

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态（继承 Dialog）。' },
  { name: 'onOpenChange', type: '(open: boolean) => void', default: '-', description: '弹窗开关回调。' },
  { name: 'title', type: 'string', default: 'Command Palette', description: '无障碍标题。' },
  { name: 'description', type: 'string', default: 'Search for a command to run...', description: '无障碍描述。' },
  { name: 'showCloseButton', type: 'boolean', default: 'true', description: '是否显示右上角关闭按钮。' },
  { name: 'className', type: 'string', default: '-', description: 'DialogContent 样式扩展。' }
]"/>

### 子组件

<DataTable preset="props" :data="[
  { name: 'CommandInput.placeholder', type: 'string', default: '-', description: '搜索输入提示文案。' },
  { name: 'CommandList.className', type: 'string', default: '-', description: '列表容器样式扩展。' },
  { name: 'CommandGroup.heading', type: 'string', default: '-', description: '分组标题。' },
  { name: 'CommandItem.onSelect', type: '(value: string) => void', default: '-', description: '命令项被选中时回调。' },
  { name: 'CommandEmpty.children', type: 'ReactNode', default: '-', description: '无结果提示内容。' },
  { name: 'CommandShortcut.children', type: 'ReactNode', default: '-', description: '快捷键信息展示。' }
]"/>

## A11y

- 命令项应使用可读文案，避免纯图标。
- 弹窗模式请确保提供 `title` 与 `description`，便于读屏理解上下文。
- 对关键操作建议同时保留可见入口，不应仅依赖命令面板。

## 常见问题 (FAQ)

### 如何实现 `⌘K` 打开命令面板？

在页面层监听快捷键并更新 `CommandDialog` 的 `open` 状态。

### 如何自定义匹配规则？

传入 `filter` 函数，返回值越高代表匹配度越高。
