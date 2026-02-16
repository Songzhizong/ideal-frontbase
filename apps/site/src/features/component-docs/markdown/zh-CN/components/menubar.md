用于桌面应用风格的菜单栏交互，支持分组、快捷键、子菜单和单选/多选项。

源码位置：`packages/ui/menubar.tsx`

## 何时使用

`Menubar` 适合功能密集型工具界面中的命令入口。

- 编辑器顶部菜单
- 数据平台工具栏菜单
- 需要二级菜单和快捷键提示的场景

不建议使用场景：

- 移动端主导航（建议使用更轻量导航组件）

## 代码演示

### 基础菜单栏

```playground
basic
```

### Checkbox 与 Radio 项

```playground
checkbox-radio
```

### 子菜单

```playground
with-submenu
```

## 属性说明 (API)

### Menubar

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '受控打开菜单值。' },
  { name: 'onValueChange', type: 'value callback', default: '-', description: '打开菜单变化回调。' },
  { name: 'loop', type: 'boolean', default: 'false', description: '键盘循环导航。' },
  { name: 'className', type: 'string', default: '-', description: '菜单栏样式扩展。' }
]"/>

### MenubarItem

<DataTable preset="props" :data="[
  { name: 'inset', type: 'boolean', default: 'false', description: '是否使用缩进对齐。' },
  { name: 'variant', type: 'default | destructive', default: 'default', description: '项视觉语义。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用当前项。' },
  { name: 'onSelect', type: 'select callback', default: '-', description: '选择回调。' }
]"/>

### MenubarCheckboxItem / MenubarRadioItem

<DataTable preset="props" :data="[
  { name: 'checked', type: 'boolean', default: '-', description: '受控选中状态。' },
  { name: 'onCheckedChange', type: 'checked callback', default: '-', description: '状态变化回调。' },
  { name: 'value', type: 'string', default: '-', description: '单选项值（RadioItem）。' }
]"/>

### MenubarContent / MenubarSubContent

<DataTable preset="props" :data="[
  { name: 'align', type: 'start | center | end', default: 'start', description: '内容对齐方式。' },
  { name: 'sideOffset', type: 'number', default: '8', description: '主轴偏移距离。' },
  { name: 'className', type: 'string', default: '-', description: '浮层样式扩展。' }
]"/>

## FAQ

### Menubar 和 DropdownMenu 的关系？

`Menubar` 是常驻菜单栏，`DropdownMenu` 是单触发器弹出菜单。

### 如何显示快捷键提示？

在 `MenubarItem` 内搭配 `MenubarShortcut` 展示。
