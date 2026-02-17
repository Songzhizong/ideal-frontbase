用于在真实内容加载前展示结构占位，减少页面闪烁并提升感知性能。

源码位置：`packages/ui/skeleton.tsx`

## 何时使用

`Skeleton` 适合在请求期间保持页面结构稳定。

- 列表或卡片首屏加载
- 表单详情请求中
- 切换筛选条件后局部占位

不建议使用场景：

- 仅几十毫秒即可返回的即时数据

## 代码演示

### 文本块占位

```playground
text-block
```

### 卡片占位

```playground
card-loading
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '控制占位块尺寸和圆角。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '通常不需要 children。' },
  { name: '...divProps', type: 'React.ComponentProps<"div">', default: '-', description: '其余原生 div 属性。' }
]"/>

## FAQ

### Skeleton 和 Spinner 怎么选择？

需要保留布局结构时用 `Skeleton`；只需提示“处理中”时用 `Spinner`。

### 占位时长怎么控制？

由业务请求状态控制渲染时机，组件本身仅负责视觉表现。
