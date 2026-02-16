用于采集单行文本输入，是构建表单、搜索和过滤器的基础控件。

源码位置：`packages/ui/input.tsx`

## 何时使用

`Input` 适合需要用户输入简短、单行文本的场景。

- 登录、注册、账号配置等基础表单
- 搜索栏与筛选条件输入
- 参数配置项（如名称、路径、数值阈值）

不建议使用场景：

- 多行或富文本内容编辑（建议使用 `Textarea`）

## 代码演示

### 基础输入

```playground
basic
```

### 搜索输入

```playground
search-field
```

### 受控输入

```playground
controlled
```

### 输入类型矩阵

```playground
type-matrix
```

### 登录表单输入

```playground
login-form
```

### 状态示例

```playground
state-default
state-disabled
state-invalid
```

## 属性说明 (API)

### Input

<DataTable preset="props" :data="[
  { name: 'type', type: 'string', default: 'text', description: '原生输入类型，如 `text` / `password` / `email` / `number`。' },
  { name: 'value', type: 'string | number | readonly string[]', default: '-', description: '受控值。' },
  { name: 'defaultValue', type: 'string | number | readonly string[]', default: '-', description: '非受控初始值。' },
  { name: 'onChange', type: '(event: ChangeEvent<HTMLInputElement>) => void', default: '-', description: '输入变化回调。' },
  { name: 'placeholder', type: 'string', default: '-', description: '输入提示文本。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用输入。' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: '只读输入，允许选中但不可编辑。' },
  { name: 'aria-invalid', type: 'boolean', default: 'false', description: '标记校验失败状态并触发错误样式。' },
  { name: 'className', type: 'string', default: '-', description: '输入框样式扩展。' },
  { name: '...props', type: 'React.ComponentProps<"input">', default: '-', description: '透传原生 input 属性（如 `min`、`max`、`autoComplete`）。' }
]"/>

## 状态指南

- 默认态：可编辑，适用于常规输入。
- 禁用态：不可交互，通常用于权限受限或系统占位值。
- 错误态：设置 `aria-invalid` 并搭配可见错误文案。
- 只读态：允许复制查看，但不允许修改。

## A11y

- 始终为 `Input` 提供可访问名称（`<Label htmlFor>` 或 `aria-label`）。
- 校验失败时建议同时设置 `aria-invalid` 与文本错误提示。
- 密码可见性切换按钮要提供 `aria-label`，明确当前行为。

## 常见问题 (FAQ)

### 如何在输入框里放搜索图标？

使用相对定位容器放置图标，再给输入框加左内边距。

```tsx
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input className="pl-9" />
</div>
```

### 受控和非受控该怎么选？

需要实时联动校验或外部状态同步时用受控（`value + onChange`）；仅提交时读取可用非受控（`defaultValue`）。
