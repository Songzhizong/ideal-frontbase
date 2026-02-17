用于按钮触发的上下文菜单，支持分组、子菜单、单选和多选项。

源码位置：`packages/ui/dropdown-menu.tsx`

## 何时使用

`DropdownMenu` 适合将次级操作折叠到一个按钮中。

- 列表行“更多操作”
- 操作工具按钮的二级菜单
- 需要紧凑展示多项命令

不建议使用场景：

- 站点主导航（建议使用 `NavigationMenu`）

## 代码演示

### 基础菜单

```playground
basic
```

### Checkbox 与 Radio 菜单项

```playground
checkbox-radio
```

### 危险操作子菜单

```playground
destructive-submenu
```

## 属性说明 (API)

### DropdownMenu

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: '-', description: '非受控初始打开状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '打开状态变化回调。' },
  { name: 'modal', type: 'boolean', default: 'true', description: '是否使用模态行为。' }
]"/>

### DropdownMenuContent

<DataTable preset="props" :data="[
  { name: 'sideOffset', type: 'number', default: '4', description: '浮层偏移。' },
  { name: 'align', type: 'start | center | end', default: 'center', description: '对齐方式。' },
  { name: 'className', type: 'string', default: '-', description: '浮层样式扩展。' }
]"/>

### DropdownMenuItem

<DataTable preset="props" :data="[
  { name: 'inset', type: 'boolean', default: 'false', description: '是否缩进。' },
  { name: 'variant', type: 'default | destructive', default: 'default', description: '菜单项语义。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用菜单项。' },
  { name: 'onSelect', type: 'select callback', default: '-', description: '选择回调。' }
]"/>

### DropdownMenuCheckboxItem / DropdownMenuRadioItem

<DataTable preset="props" :data="[
  { name: 'checked', type: 'boolean', default: '-', description: '受控选中状态。' },
  { name: 'onCheckedChange', type: 'checked callback', default: '-', description: '选中状态变化回调。' },
  { name: 'value', type: 'string', default: '-', description: '单选项值（RadioItem）。' }
]"/>

## FAQ

### 如何放危险操作？

对 `DropdownMenuItem` 使用 `variant='destructive'`，并建议置于子菜单或分隔线后。

### 菜单为什么被遮挡？

组件默认走 Portal，若容器样式特殊请检查层级与 `z-index`。
