用于轮播展示内容，基于 Embla 封装，支持横向/纵向滚动与外部 API 控制。

源码位置：`packages/ui/carousel.tsx`

## 何时使用

`Carousel` 适合在有限区域展示多屏内容。

- 首页 Banner / 宣传卡片轮播
- 多版本对比、步骤分屏展示
- 移动端横向信息流滑动

不建议使用场景：

- 需要一次性完整阅读的关键信息（建议直接平铺）

## 代码演示

### 基础轮播

```playground
basic
```

### 纵向轮播

```playground
vertical
```

### 外部 API 控制

```playground
controlled-api
```

## 属性说明 (API)

### Carousel

<DataTable preset="props" :data="[
  { name: 'orientation', type: 'horizontal | vertical', default: 'horizontal', description: '滚动方向。' },
  { name: 'opts', type: 'CarouselOptions', default: '-', description: 'Embla 初始化选项。' },
  { name: 'plugins', type: 'CarouselPlugin[]', default: '-', description: 'Embla 插件列表。' },
  { name: 'setApi', type: '(api: CarouselApi) => void', default: '-', description: '暴露 Embla API 给外部控制。' },
  { name: 'className', type: 'string', default: '-', description: '外层容器样式扩展。' }
]"/>

### CarouselContent / CarouselItem

<DataTable preset="props" :data="[
  { name: 'CarouselContent.className', type: 'string', default: '-', description: '轨道容器样式扩展。' },
  { name: 'CarouselItem.className', type: 'string', default: '-', description: '单页样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '轮播内容。' }
]"/>

### CarouselPrevious / CarouselNext

<DataTable preset="props" :data="[
  { name: 'variant / size', type: 'Button props', default: 'outline / icon', description: '导航按钮样式。' },
  { name: 'className', type: 'string', default: '-', description: '按钮样式扩展。' },
  { name: '...props', type: 'React.ComponentProps<Button>', default: '-', description: '透传按钮属性。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'CarouselApi', value: 'UseEmblaCarouselType[1]' },
  { name: 'CarouselOptions', value: 'Embla 选项类型（通过 opts 传入）' },
  { name: 'CarouselPlugin', value: 'Embla 插件类型（通过 plugins 传入）' }
]"/>

## A11y

- 组件内置左右方向键导航，建议保留可见按钮以兼容触屏用户。
- 每个 `CarouselItem` 内容应独立可理解，避免上下文丢失。
- 自动播放场景建议提供暂停能力，减少可访问性风险。

## 常见问题 (FAQ)

### 如何在外部控制翻页？

通过 `setApi` 拿到 `CarouselApi` 后调用 `scrollPrev` / `scrollNext`。

### 纵向轮播怎么开启？

设置 `orientation="vertical"`，并给容器明确高度。
