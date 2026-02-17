在 `SheetContent` 基础上提供应用级样式变体，支持 floating 与 flush 两种布局策略。

源码位置：`packages/ui/app-sheet.tsx`

## 何时使用

`AppSheetContent` 适合需要更统一品牌化面板外观的应用场景。

- 工作台侧栏面板
- 设置中心浮动面板
- 轻量弹出工具区

不建议使用场景：

- 只需默认 Sheet 行为且无需额外样式变体

## 代码演示

### Floating 变体

```playground
floating
```

### Flush 变体

```playground
flush
```

### 顶部 Floating

```playground
top-floating
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'variant', type: 'floating | flush', default: 'floating', description: '样式变体。' },
  { name: 'side', type: 'top | right | bottom | left', default: 'right', description: '面板方向。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式扩展。' },
  { name: '...SheetContentProps', type: '继承', default: '-', description: '继承 SheetContent 能力。' }
]"/>

## FAQ

### `AppSheetContent` 与 `SheetContent` 的关系？

`AppSheetContent` 是对 `SheetContent` 的样式封装，交互能力相同。

### 何时选择 `floating`？

当你希望面板与屏幕边缘保留留白并增强层次感时使用。
