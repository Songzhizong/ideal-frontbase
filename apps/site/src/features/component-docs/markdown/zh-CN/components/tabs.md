用于在同一页面内切换并组织分块内容，支持横向、纵向和线性风格。

源码位置：`packages/ui/tabs.tsx`

## 何时使用

`Tabs` 适合同层级内容之间的快速切换。

- 详情页中的“概览 / 日志 / 配置”切换
- 设置页模块分栏
- 编辑页多状态面板

不建议使用场景：

- 页面之间需要独立路由和可分享链接（建议使用路由导航）

## 代码演示

### 基础用法

```playground
basic
```

### 线性样式

```playground
line-variant
```

### 纵向模式

```playground
vertical
```

## 属性说明 (API)

### Tabs

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '受控激活值。' },
  { name: 'defaultValue', type: 'string', default: '-', description: '非受控初始激活值。' },
  { name: 'onValueChange', type: 'value callback', default: '-', description: '激活项变化回调。' },
  { name: 'orientation', type: 'horizontal | vertical', default: 'horizontal', description: '切换方向。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' }
]"/>

### TabsList

<DataTable preset="props" :data="[
  { name: 'variant', type: 'default | line', default: 'default', description: '列表视觉风格。' },
  { name: 'loop', type: 'boolean', default: 'true', description: '键盘循环切换。' },
  { name: 'className', type: 'string', default: '-', description: '列表样式扩展。' }
]"/>

### TabsTrigger

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '触发项唯一值。', required: true },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用当前项。' },
  { name: 'className', type: 'string', default: '-', description: '触发项样式扩展。' }
]"/>

### TabsContent

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '内容面板对应值。', required: true },
  { name: 'forceMount', type: 'boolean', default: 'false', description: '是否始终挂载内容。' },
  { name: 'className', type: 'string', default: '-', description: '内容面板样式扩展。' }
]"/>

## FAQ

### `Tabs` 能否配合 URL 参数？

可以，把 `value` 做成受控，并与路由参数或查询参数双向同步。

### 什么时候使用 `line` 变体？

当页面信息密度高、需要更轻量视觉时可使用 `line` 风格。
