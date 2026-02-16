基于 `react-hook-form` 的表单基础设施封装，统一字段上下文、可访问属性和错误提示渲染。

源码位置：`packages/ui/form.tsx`

## 何时使用

`Form` 组件组用于标准化 `react-hook-form` 在页面中的接入方式。

- 需要统一字段标签、描述、错误提示
- 需要将任意控件接入表单上下文
- 需要降低表单模板重复代码

不建议使用场景：

- 不依赖 `react-hook-form` 的简单本地状态输入

## 代码演示

### 基础校验

```playground
basic-validation
```

### 结合 Select

```playground
with-select
```

### 表单状态驱动

```playground
form-state
```

## 属性说明 (API)

### Form

<DataTable preset="props" :data="[
  { name: '...useFormReturn', type: 'UseFormReturn', default: '-', description: '直接透传 useForm 的返回对象。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '表单内容。' },
  { name: '用途', type: '-', default: '-', description: '本质是 FormProvider 封装。' }
]"/>

### FormField

<DataTable preset="props" :data="[
  { name: 'name', type: 'FieldPath', default: '-', description: '字段名。', required: true },
  { name: 'control', type: 'Control', default: '-', description: '来自 useForm 的 control。', required: true },
  { name: 'rules', type: 'validation rules', default: '-', description: '字段校验规则。' },
  { name: 'render', type: 'render callback', default: '-', description: '渲染字段 UI。', required: true }
]"/>

### FormItem / FormLabel / FormControl / FormDescription / FormMessage

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '字段结构内容。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' },
  { name: '用途', type: '-', default: '-', description: '提供统一的 id、aria 和错误展示链路。' }
]"/>

### useFormField

<DataTable preset="props" :data="[
  { name: '返回值.id', type: 'string', default: '-', description: '字段唯一 id。' },
  { name: '返回值.formItemId', type: 'string', default: '-', description: '控件 id。' },
  { name: '返回值.formDescriptionId', type: 'string', default: '-', description: '描述节点 id。' },
  { name: '返回值.formMessageId', type: 'string', default: '-', description: '错误消息节点 id。' },
  { name: '返回值.error', type: 'FieldError | undefined', default: '-', description: '当前字段错误信息。' }
]"/>

## FAQ

### 为什么 `FormControl` 要包裹输入组件？

它会自动注入 `id`、`aria-describedby`、`aria-invalid`，确保可访问性和错误提示联动。

### `FormMessage` 不传内容会显示什么？

默认显示字段校验错误消息；无错误时不渲染。
