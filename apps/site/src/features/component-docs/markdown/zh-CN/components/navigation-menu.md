用于构建顶部主导航，支持触发器、内容面板、指示器与视口动画。

源码位置：`packages/ui/navigation-menu.tsx`

## 何时使用

`NavigationMenu` 适合站点级主导航或产品信息架构入口。

- 官网顶部导航
- 产品模块导航
- 带下拉面板的导航菜单

不建议使用场景：

- 仅单个按钮触发的小菜单（建议 `DropdownMenu`）

## 代码演示

### 顶部导航基础用法

```playground
basic-topnav
```

### 关闭 Viewport 模式

```playground
without-viewport
```

### 指示器

```playground
with-indicator
```

## 属性说明 (API)

### NavigationMenu

<DataTable preset="props" :data="[
  { name: 'viewport', type: 'boolean', default: 'true', description: '是否启用统一视口容器。' },
  { name: 'value', type: 'string', default: '-', description: '受控激活项值。' },
  { name: 'onValueChange', type: 'value callback', default: '-', description: '激活项变化回调。' },
  { name: 'delayDuration', type: 'number', default: '-', description: '打开延迟。' },
  { name: 'className', type: 'string', default: '-', description: '根容器样式扩展。' }
]"/>

### NavigationMenuTrigger

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '触发器文本或内容。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用当前触发器。' },
  { name: 'className', type: 'string', default: '-', description: '触发器样式扩展。' }
]"/>

### NavigationMenuContent

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '展开面板内容。' },
  { name: 'className', type: 'string', default: '-', description: '内容面板样式扩展。' },
  { name: 'forceMount', type: 'boolean', default: 'false', description: '是否强制挂载内容。' }
]"/>

### NavigationMenuLink

<DataTable preset="props" :data="[
  { name: 'asChild', type: 'boolean', default: 'false', description: '将链接样式注入子组件。' },
  { name: 'active', type: 'boolean', default: 'false', description: '当前项激活态。' },
  { name: 'className', type: 'string', default: '-', description: '链接样式扩展。' }
]"/>

## FAQ

### `viewport` 开关有什么区别？

`viewport=true` 使用统一浮层视口，适合复杂导航；`false` 更接近普通下拉菜单。

### 如何高亮当前导航项？

给对应 `NavigationMenuLink` 设置 `active` 或用受控 `value` 管理。
