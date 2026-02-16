用于构建应用级侧边导航布局，支持桌面折叠、移动抽屉、浮动与 inset 变体。

源码位置：`packages/ui/sidebar.tsx`

## 何时使用

`Sidebar` 适合后台系统、控制台和工具型产品主布局。

- 应用主导航
- 多级菜单组织
- 桌面与移动端统一侧栏交互

不建议使用场景：

- 轻量单页营销站点

## 代码演示

### 基础布局

```playground
basic-layout
```

### Icon 折叠模式

```playground
collapsible-icon
```

### Floating 变体

```playground
floating-variant
```

## 属性说明 (API)

### SidebarProvider

<DataTable preset="props" :data="[
  { name: 'defaultOpen', type: 'boolean', default: 'true', description: '非受控初始展开状态。' },
  { name: 'open', type: 'boolean', default: '-', description: '受控展开状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '展开状态变化回调。' },
  { name: 'menuAccordion', type: 'boolean', default: 'false', description: '菜单手风琴模式。' }
]"/>

### Sidebar

<DataTable preset="props" :data="[
  { name: 'side', type: 'left | right', default: 'left', description: '侧栏位置。' },
  { name: 'variant', type: 'sidebar | floating | inset', default: 'sidebar', description: '视觉变体。' },
  { name: 'collapsible', type: 'offcanvas | icon | none', default: 'offcanvas', description: '折叠行为。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' }
]"/>

### SidebarMenuButton

<DataTable preset="props" :data="[
  { name: 'isActive', type: 'boolean', default: 'false', description: '是否激活。' },
  { name: 'variant', type: 'default | outline', default: 'default', description: '按钮样式。' },
  { name: 'size', type: 'default | sm | lg', default: 'default', description: '按钮尺寸。' },
  { name: 'tooltip', type: 'string | tooltip props', default: '-', description: '折叠态提示。' },
  { name: 'asChild', type: 'boolean', default: 'false', description: '将样式注入子组件。' }
]"/>

### 常用结构组件

<DataTable preset="props" :data="[
  { name: 'SidebarTrigger', type: '-', default: '-', description: '切换展开/收起。' },
  { name: 'SidebarInset', type: '-', default: '-', description: '主内容承载区。' },
  { name: 'SidebarHeader/Footer/Content', type: '-', default: '-', description: '侧栏布局分区。' },
  { name: 'SidebarGroup / SidebarGroupLabel / SidebarGroupContent', type: '-', default: '-', description: '菜单分组结构。' },
  { name: 'SidebarMenu / SidebarMenuItem / SidebarMenuButton', type: '-', default: '-', description: '菜单项结构。' }
]"/>

## FAQ

### 如何在移动端自动变成抽屉？

`Sidebar` 内部会根据 `useIsMobile` 自动切换到 `Sheet` 模式。

### 如何实现快捷键开关侧栏？

组件默认绑定 `Ctrl/Cmd + B`，可直接使用 `SidebarProvider` 内置行为。
