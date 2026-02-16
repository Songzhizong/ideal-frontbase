用于为表单控件提供可访问名称，确保输入域语义清晰、可读且可点击关联。

源码位置：`packages/ui/label.tsx`

## 何时使用

所有输入控件都应配套 `Label`，避免“只有占位符无标签”的无语义输入。

- 表单字段命名
- 必填信息标记
- 字段说明或分组标题

不建议使用场景：

- 将 `Label` 当作普通排版文本使用

## 代码演示

### 基础表单标注

```playground
basic-form
```

### 必填与提示说明

```playground
with-required-and-hint
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'htmlFor', type: 'string', default: '-', description: '关联输入控件 id。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式类。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '标签文本或图标内容。' }
]"/>

## FAQ

### 是否可以只写 placeholder 不写 Label？

不建议。`placeholder` 不能替代可访问标签，仍应提供 `Label` 或 `aria-label`。

### 如何给必填字段加星号？

在 `Label` 内追加语义文本或样式标记，并保持字段说明清晰。
