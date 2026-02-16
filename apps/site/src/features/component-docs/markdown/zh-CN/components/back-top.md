用于快速返回顶部，支持窗口或自定义滚动容器监听。

源码位置：`packages/ui/back-top.tsx`

## 何时使用

`BackTop` 适合内容较长、用户需要频繁回到起始位置的页面。

- 长列表页
- 文档详情页
- 滚动容器内容页

不建议使用场景：

- 页面内容很短且几乎无需滚动

## 代码演示

### 基础回到顶部

```playground
basic
```

### 自定义位置与图标

```playground
custom-position
```

### 自定义点击处理

```playground
with-handler
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'target', type: 'container getter', default: 'window', description: '监听和滚动的目标容器。' },
  { name: 'visibleHeight', type: 'number', default: '240', description: '显示阈值（滚动高度）。' },
  { name: 'right', type: 'number | string', default: '24', description: '右侧定位。' },
  { name: 'bottom', type: 'number | string', default: '24', description: '底部定位。' },
  { name: 'onClick', type: 'custom click callback', default: '-', description: '可接管点击并调用内置 scrollToTop。' },
  { name: 'className', type: 'string', default: '-', description: '按钮样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '默认向上图标', description: '自定义按钮内容。' }
]"/>

## FAQ

### 如何绑定到某个滚动容器？

通过 `target={() => containerRef.current}` 指定容器。

### 如何在点击时加埋点？

在 `onClick` 中先上报，再调用回调参数里的 `scrollToTop()`。
