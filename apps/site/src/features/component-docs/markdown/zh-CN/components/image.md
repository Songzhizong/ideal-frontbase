用于展示图片资源，内置占位、懒加载、失败兜底以及单图/组图预览能力。

源码位置：`packages/ui/image.tsx`

## 何时使用

当你需要比原生 `<img>` 更完整的加载与预览体验时，优先使用 `Image`。

- 需要图片加载占位或失败兜底
- 需要点击放大预览
- 需要组图浏览（上一张 / 下一张）

不建议使用场景：

- 极简静态图片且无需占位、预览、懒加载能力

## 代码演示

### 基础渲染

```playground
basic
```

### 单图预览

```playground
preview
```

### 组图预览

```playground
preview-group
```

### 懒加载与失败兜底

```playground
lazy-fallback
```

## 属性说明 (API)

### Image

<DataTable preset="props" :data="[
  { name: 'src', type: 'string', default: '-', description: '图片地址。' },
  { name: 'alt', type: 'string', default: '-', description: '替代文本。' },
  { name: 'preview', type: 'boolean', default: 'false', description: '是否启用点击预览。' },
  { name: 'lazy', type: 'boolean', default: 'false', description: '是否启用懒加载。' },
  { name: 'fallback', type: 'string | ReactNode', default: '-', description: '加载失败兜底内容。' },
  { name: 'placeholder', type: 'ReactNode', default: '<Skeleton />', description: '加载中的占位内容。' },
  { name: 'containerClassName', type: 'string', default: '-', description: '外层容器样式。' }
]"/>

### ImagePreviewGroup

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '组图中的 Image 子节点。' },
  { name: 'className', type: 'string', default: '-', description: '组图容器样式。' },
  { name: '...divProps', type: 'React.ComponentProps<"div">', default: '-', description: '其余原生 div 属性。' }
]"/>

### ImageLoading

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '加载占位容器样式。' },
  { name: 'children', type: '-', default: '-', description: '该组件固定渲染旋转图标。' },
  { name: '用途', type: '-', default: '-', description: '通常作为 Image 的 placeholder 传入。' }
]"/>

## FAQ

### 组图预览如何切换上一张/下一张？

将多张 `Image preview` 放在 `ImagePreviewGroup` 内即可自动获得组图导航。

### 什么时候需要开启 `lazy`？

长列表和首屏外图片建议开启 `lazy`，可减少首屏加载压力。
