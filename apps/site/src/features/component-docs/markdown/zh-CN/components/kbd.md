用于展示键盘按键或快捷键组合，帮助用户快速理解可用操作。

源码位置：`packages/ui/kbd.tsx`

## 何时使用

`Kbd` 常与文案提示、命令面板、帮助弹窗配合使用。

- 呈现单个按键提示（如 Esc）
- 展示组合快捷键（如 ⌘ + K）
- 帮助中心中的操作指引

不建议使用场景：

- 用于可点击按钮（`Kbd` 仅用于展示，不承载交互）

## 代码演示

### 单按键提示

```playground
single
```

### 组合快捷键

```playground
shortcuts
```

## 属性说明 (API)

### Kbd

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '按键文本或图标。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式类。' },
  { name: '...kbdProps', type: 'React.ComponentProps<"kbd">', default: '-', description: '其余原生 kbd 属性。' }
]"/>

### KbdGroup

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '一组 Kbd 子元素。' },
  { name: 'className', type: 'string', default: '-', description: '分组样式扩展。' },
  { name: '...divProps', type: 'React.ComponentProps<"div">', default: '-', description: '其余原生 div 属性。' }
]"/>

## FAQ

### `KbdGroup` 的作用是什么？

用于组合多个 `Kbd`，统一处理间距，避免手动插入分隔样式。

### 可以在 `Kbd` 里放图标吗？

可以，组件已内置图标尺寸约束样式。
