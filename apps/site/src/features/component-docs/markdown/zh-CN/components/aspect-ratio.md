用于按固定宽高比约束内容区域，避免图片或媒体加载前后产生布局抖动。

源码位置：`packages/ui/aspect-ratio.tsx`

## 何时使用

当内容容器需要维持稳定比例时，使用 `AspectRatio` 包裹媒体内容。

- 封面图和视频缩略图
- 卡片网格中的统一图片比例
- 需要避免 CLS 的媒体列表

不建议使用场景：

- 内容高度需要随文本自然增长的区块

## 代码演示

### 16:9 媒体封面

```playground
media-cover
```

### 多比例图库

```playground
gallery-grid
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'ratio', type: 'number', default: '-', description: '宽高比（width / height），如 16 / 9。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '被约束比例的内容。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' }
]"/>

## FAQ

### 如何做正方形头像墙？

将 `ratio` 设为 `1`，并在内部放入 `Image` 或自定义内容。

### 比例容器里图片会被拉伸吗？

建议给内部图片设置 `object-cover`，保持裁切而非拉伸。
