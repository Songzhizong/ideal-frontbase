用于为组件树提供全局方向上下文（LTR / RTL），解决多语言布局方向切换问题。

源码位置：`packages/ui/direction.tsx`

## 何时使用

当页面需要支持阿拉伯语、希伯来语等 RTL 语言时，使用 `DirectionProvider` 统一控制方向。

- 国际化站点方向切换
- 局部组件的方向覆盖
- 与 Radix 组件协同控制布局方向

不建议使用场景：

- 仅为单个文本段落做对齐（可用普通样式处理）

## 代码演示

### RTL 方向预览

```playground
rtl-preview
```

### direction 覆盖优先级

```playground
override
```

## 属性说明 (API)

### DirectionProvider

<DataTable preset="props" :data="[
  { name: 'dir', type: `'ltr' | 'rtl'`, default: '-', description: '兼容 Radix 原生方向字段。' },
  { name: 'direction', type: `'ltr' | 'rtl'`, default: '-', description: '推荐使用的方向字段，优先级高于 dir。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '需要继承方向上下文的子树。' }
]"/>

### useDirection

<DataTable preset="props" :data="[
  { name: '返回值', type: `'ltr' | 'rtl'`, default: '-', description: '读取当前方向上下文。' },
  { name: '调用位置', type: 'React 组件内部', default: '-', description: '仅可在函数组件中调用。' },
  { name: '用途', type: '-', default: '-', description: '用于根据方向切换图标或布局。' }
]"/>

## FAQ

### `dir` 和 `direction` 应该用哪个？

优先使用 `direction`，组件内部会回退到 `dir`，并保持与 Radix 兼容。

### 如何在局部区域使用 RTL？

把该区域包裹在 `DirectionProvider direction="rtl"` 中即可。
