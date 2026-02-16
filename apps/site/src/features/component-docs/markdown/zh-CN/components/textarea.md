用于采集多行文本输入，适合承载说明、备注、反馈等长文本场景。

源码位置：`packages/ui/textarea.tsx`

## 何时使用

`Textarea` 适用于需要连续输入完整段落信息的场景。

- 工单描述、问题反馈、发布说明
- 审批意见、备注信息
- 需要配合字数限制和校验提示的输入区

不建议使用场景：

- 仅单行短文本输入（建议使用 `Input`）

## 代码演示

### 基础用法

```playground
basic
```

### 常见状态

```playground
states
```

### 表单集成

```playground
form-integration
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '受控值。' },
  { name: 'defaultValue', type: 'string', default: '-', description: '非受控初始值。' },
  { name: 'rows', type: 'number', default: '-', description: '初始可见行数。' },
  { name: 'maxLength', type: 'number', default: '-', description: '最大可输入字符数。' },
  { name: 'aria-invalid', type: 'boolean', default: 'false', description: '校验失败时设置为 true。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用输入。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式。' }
]"/>

## FAQ

### 如何显示剩余字数？

使用受控模式监听 `value.length`，并结合 `maxLength` 展示剩余字数。

### 如何标记校验错误？

设置 `aria-invalid`，并在下方配合错误提示文案。
