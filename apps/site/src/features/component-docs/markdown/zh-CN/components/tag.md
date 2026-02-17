用于标记、分类或展示状态信息的标签组件。

源码位置：`packages/ui/tag.tsx`

## 何时使用

`Tag` 适合表达离散的短文本语义，不承担复杂输入与编辑流程。

- 状态识别（如“运行中”“告警中”）
- 轻量分类（如“Primary”“Staging”）
- 可关闭标签集合（配合 `closable`）

## 代码演示

### 颜色 Color

```playground
color
```

### 变体 Variant

```playground
variant
```

### 形状 Shape

```playground
shape
```

### 尺寸 Size

```playground
size
```

### 可关闭 Closable

```playground
closable
```

### 插槽 Slot

```playground
slot
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'color', type: '`primary` | `destructive` | `success` | `warning` | `info` | `carbon` | `secondary` | `accent`', default: '`primary`', description: '标签颜色。' },
  { name: 'variant', type: '`solid` | `outline` | `dashed` | `soft` | `ghost` | `link` | `plain` | `pure`', default: '`soft`', description: '标签视觉变体。' },
  { name: 'size', type: '`xs` | `sm` | `md` | `lg` | `xl` | `2xl`', default: '`md`', description: '标签尺寸。' },
  { name: 'shape', type: '`rounded` | `circle` | `square`', default: '`rounded`', description: '标签形状。' },
  { name: 'closable', type: 'boolean', default: 'false', description: '是否显示关闭按钮。' },
  { name: 'content', type: 'string', default: '-', description: '标签内容（默认插槽的字符串替代）。' },
  { name: 'closeSlot', type: 'ReactNode', default: '-', description: '自定义关闭按钮内容。' },
  { name: 'ui', type: '`{ root?: string; close?: string }`', default: '{}', description: '自定义根节点与关闭按钮类名。' },
  { name: 'asChild', type: 'boolean', default: 'false', description: '将样式注入子元素。' },
  { name: 'onClose', type: '(event) => void', default: '-', description: '点击关闭按钮时触发。' },
  { name: 'onClick', type: '(event) => void', default: '-', description: '点击标签时触发。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式类。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '默认插槽内容。' }
]"/>

## 事件

<DataTable preset="emits" :data="[
  { name: 'onClose', parameters: '(event: MouseEvent) => void', description: '点击关闭按钮时触发。' },
  { name: 'onClick', parameters: '(event: MouseEvent) => void', description: '点击标签根节点时触发。' }
]"/>

## 插槽

<DataTable preset="slots" :data="[
  { name: 'default', parameters: '-', description: '标签内容。' },
  { name: 'closeSlot', parameters: '-', description: '自定义关闭按钮内容。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'TagColor', value: '`primary` | `destructive` | `success` | `warning` | `info` | `carbon` | `secondary` | `accent`' },
  { name: 'TagVariant', value: '`solid` | `outline` | `dashed` | `soft` | `ghost` | `link` | `plain` | `pure`' },
  { name: 'TagShape', value: '`rounded` | `circle` | `square`' },
  { name: 'TagSize', value: '`xs` | `sm` | `md` | `lg` | `xl` | `2xl`' }
]"/>

## FAQ

### 如何表达“次级/危险”语义？

使用新 API 的组合表达：

- 次级：`variant="solid" color="secondary"`
- 危险：`variant="solid" color="destructive"`
