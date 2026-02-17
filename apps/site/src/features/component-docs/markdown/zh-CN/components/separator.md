用于在同级内容之间建立视觉分隔，降低信息干扰并提升阅读节奏。

源码位置：`packages/ui/separator.tsx`

## 何时使用

`Separator` 适合在内容密集区域中提供轻量级分隔。

- 列表项之间的结构分段
- 顶部工具栏中动作区域分割
- 表单区块之间的视觉断点

不建议使用场景：

- 需要语义分组时（应优先使用标题、列表或 section 结构）

## 代码演示

### 水平分隔

```playground
horizontal-content
```

### 垂直分隔

```playground
vertical-layout
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'orientation', type: `'horizontal' | 'vertical'`, default: `'horizontal'`, description: '分隔线方向。' },
  { name: 'decorative', type: 'boolean', default: 'true', description: '是否为装饰性元素。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'SeparatorOrientation', value: `'horizontal' | 'vertical'` }
]"/>

## FAQ

### 什么时候用 `decorative={false}`？

当分隔线对辅助技术有语义意义时可设置为 `false`，否则建议保持默认 `true`。

### 垂直分隔线为什么不显示？

垂直分隔线需要父容器有明确高度，例如 `h-10`。
