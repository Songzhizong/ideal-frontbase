用于将多个关联操作组织成一个连续操作区，确保按钮样式与交互语义一致。

源码位置：`packages/ui/button-group.tsx`

## 何时使用

适用于一组同级操作需要同时出现的场景，避免按钮散落导致视觉噪声。

- 操作栏中存在“提交 / 保存 / 更多”这类连续动作
- 需要统一控制一组按钮的 `size`、`variant`、`color`
- 列表项内需要紧凑排列的批量操作

不建议使用场景：

- 操作之间并非同级关系，且需要明显主次区分（建议独立按钮布局）

## 代码演示

### 基础组合

```playground
basic
```

### 组级变体与尺寸透传

```playground
variant-and-size
```

### 垂直工具栏

```playground
vertical-toolbar
```

### 文本块与分隔线

```playground
with-separator-text
```

### 整组禁用

```playground
disabled-scope
```

## 属性说明 (API)

### ButtonGroup

<DataTable preset="props" :data="[
  { name: 'orientation', type: `'horizontal' | 'vertical'`, default: `'horizontal'`, description: '分组方向，控制按钮拼接规则。' },
  { name: 'dir', type: `'ltr' | 'rtl'`, default: `'ltr'`, description: '文本方向，用于 RTL/LTR 场景。' },
  { name: 'color', type: 'ButtonColor', default: '-', description: '组级颜色，会透传给组内按钮。' },
  { name: 'size', type: 'ButtonProps["size"]', default: '-', description: '组级尺寸，会透传给组内按钮。' },
  { name: 'variant', type: 'ButtonProps["variant"]', default: '-', description: '组级变体，会透传给组内按钮。' },
  { name: 'shape', type: 'ButtonProps["shape"]', default: '-', description: '组级形状，会透传给组内按钮。' },
  { name: 'shadow', type: 'ButtonProps["shadow"]', default: '-', description: '组级阴影，会透传给组内按钮。' },
  { name: 'fitContent', type: 'ButtonProps["fitContent"]', default: '-', description: '组级宽度策略，会透传给组内按钮。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用整个 fieldset 分组。' }
]"/>

### ButtonGroupText

<DataTable preset="props" :data="[
  { name: 'asChild', type: 'boolean', default: 'false', description: '将样式注入子元素。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '文本块内容。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式类。' }
]"/>

### ButtonGroupSeparator

<DataTable preset="props" :data="[
  { name: 'orientation', type: `'horizontal' | 'vertical'`, default: `'vertical'`, description: '分隔线方向。' },
  { name: 'decorative', type: 'boolean', default: 'true', description: '是否仅作装饰，不参与语义树。' },
  { name: 'className', type: 'string', default: '-', description: '自定义分隔线样式。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ButtonGroupOrientation', value: `'horizontal' | 'vertical'` },
  { name: 'ButtonGroupDir', value: `'ltr' | 'rtl'` }
]"/>

## FAQ

### 如何统一设置组内按钮的样式？

将样式属性放到 `ButtonGroup` 上即可透传给组内按钮。

```tsx
<ButtonGroup variant="outline" size="sm" color="secondary">
  <Button>上一页</Button>
  <Button>下一页</Button>
</ButtonGroup>
```

### 什么时候使用 `ButtonGroupSeparator`？

当一组按钮中存在“逻辑分段”时使用分隔线，帮助用户快速理解操作块边界。
