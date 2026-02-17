用于构建语义化字段布局，统一字段标题、描述、错误信息和分组结构。

源码位置：`packages/ui/field.tsx`

## 何时使用

`Field` 适合在不依赖表单库时组织复杂字段区块。

- 配置页字段布局
- 详情编辑器字段分组
- 需要统一错误文案展示的输入区

不建议使用场景：

- 已完全由 `react-hook-form` + `Form` 体系管理的字段（优先用 `FormItem`）

## 代码演示

### 基础字段

```playground
basic
```

### 横向与响应式布局

```playground
orientation
```

### 分组与错误展示

```playground
group-and-error
```

## 属性说明 (API)

### Field

<DataTable preset="props" :data="[
  { name: 'orientation', type: 'vertical | horizontal | responsive', default: 'vertical', description: '字段方向布局。' },
  { name: 'className', type: 'string', default: '-', description: '字段容器样式扩展。' },
  { name: 'data-invalid', type: 'boolean', default: 'false', description: '标记字段无效状态。' }
]"/>

### FieldLabel / FieldTitle / FieldDescription

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '标签、标题、描述内容。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' },
  { name: 'htmlFor', type: 'string', default: '-', description: 'Label 与控件关联 id（FieldLabel）。' }
]"/>

### FieldError

<DataTable preset="props" :data="[
  { name: 'errors', type: 'array of error message', default: '-', description: '错误对象数组，会自动去重并渲染。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '自定义错误内容，优先级高于 errors。' },
  { name: 'className', type: 'string', default: '-', description: '错误样式扩展。' }
]"/>

### FieldSet / FieldLegend / FieldGroup / FieldSeparator

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '分组与分隔结构内容。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' },
  { name: 'variant', type: 'legend | label', default: 'legend', description: 'FieldLegend 展示样式。' }
]"/>

## FAQ

### `Field` 和 `FormItem` 如何选择？

需要表单校验上下文时用 `FormItem`；只做字段结构组织时用 `Field`。

### `FieldError` 能否同时展示多条错误？

可以，传入 `errors` 数组会自动渲染成去重列表。
