用于从屏幕边缘滑入的操作面板，适合移动端和窄屏场景。

源码位置：`packages/ui/drawer.tsx`

## 何时使用

`Drawer` 适合不希望完全中断上下文的补充操作。

- 移动端底部操作面板
- 侧边筛选器
- 快速详情查看

不建议使用场景：

- 需要强制确认的危险流程（优先 `AlertDialog`）

## 代码演示

### 底部抽屉

```playground
basic-bottom
```

### 侧边抽屉

```playground
side
```

### 受控模式

```playground
controlled
```

## 属性说明 (API)

### Drawer

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: '-', description: '非受控初始状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '打开状态回调。' },
  { name: 'direction', type: 'top | bottom | left | right', default: 'bottom', description: '抽屉方向。' },
  { name: 'dismissible', type: 'boolean', default: 'true', description: '是否允许点击遮罩关闭。' }
]"/>

### DrawerContent

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '内容容器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '抽屉内容。' },
  { name: 'data-vaul-drawer-direction', type: '自动注入', default: '-', description: '根据 direction 控制布局类。' }
]"/>

### 结构组件

<DataTable preset="props" :data="[
  { name: 'DrawerHeader/Footer', type: '-', default: '-', description: '头尾布局区。' },
  { name: 'DrawerTitle/Description', type: '-', default: '-', description: '标题与说明。' },
  { name: 'DrawerTrigger/Close', type: '-', default: '-', description: '打开和关闭触发器。' }
]"/>

## FAQ

### Drawer 与 Sheet 如何选？

`Drawer` 基于 Vaul，移动端手势与底部面板体验更强；`Sheet` 更偏通用侧滑面板。

### 如何让抽屉从右侧出现？

在 `Drawer` 上传 `direction='right'`。
