用于右键触发菜单，适合文件管理、画布编辑等“就地操作”场景。

源码位置：`packages/ui/context-menu.tsx`

## 何时使用

`ContextMenu` 适用于对当前对象进行局部命令操作。

- 文件/文件夹右键菜单
- 白板/画布节点右键操作
- 表格行或卡片块就地操作

不建议使用场景：

- 常规主流程操作入口（建议用按钮或 Dropdown）

## 代码演示

### 基础右键菜单

```playground
basic
```

### Checkbox 与 Radio 菜单项

```playground
checkbox-radio
```

### 子菜单

```playground
submenu
```

## 属性说明 (API)

### ContextMenu

<DataTable preset="props" :data="[
  { name: 'modal', type: 'boolean', default: 'true', description: '是否启用模态交互。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '菜单打开状态回调。' },
  { name: 'dir', type: 'ltr | rtl', default: 'ltr', description: '文本方向。' }
]"/>

### ContextMenuTrigger

<DataTable preset="props" :data="[
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用右键触发。' },
  { name: 'className', type: 'string', default: '-', description: '触发区域样式。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '触发区域内容。' }
]"/>

### ContextMenuContent

<DataTable preset="props" :data="[
  { name: 'sideOffset', type: 'number', default: '-', description: '浮层偏移。' },
  { name: 'alignOffset', type: 'number', default: '-', description: '对齐偏移。' },
  { name: 'className', type: 'string', default: '-', description: '浮层样式扩展。' }
]"/>

### ContextMenuItem

<DataTable preset="props" :data="[
  { name: 'variant', type: 'default | destructive', default: 'default', description: '菜单项语义。' },
  { name: 'inset', type: 'boolean', default: 'false', description: '是否缩进。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用菜单项。' },
  { name: 'onSelect', type: 'select callback', default: '-', description: '选择回调。' }
]"/>

## FAQ

### 如何限制菜单仅在某块区域内可用？

将该区域包裹在 `ContextMenuTrigger` 内即可。

### 右键菜单能否包含子菜单？

可以，使用 `ContextMenuSub`、`ContextMenuSubTrigger`、`ContextMenuSubContent`。
