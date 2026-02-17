用于在有限空间内组织可折叠内容，帮助用户按需展开阅读。

源码位置：`packages/ui/accordion.tsx`

## 何时使用

`Accordion` 适合分段信息展示与 FAQ 场景。

- 常见问题列表（FAQ）
- 设置页中的分组说明
- 配置面板中的分段高级选项

不建议使用场景：

- 需要同时对比全部内容且频繁切换（建议直接平铺或使用 `Tabs`）

## 代码演示

### 基础折叠

```playground
basic
```

### 多项同时展开

```playground
multiple
```

### 自定义触发器内容

```playground
custom-trigger
```

## 属性说明 (API)

### Accordion

<DataTable preset="props" :data="[
  { name: 'type', type: 'single | multiple', default: '-', description: '展开模式：单开或多开。' },
  { name: 'value', type: 'string | string[]', default: '-', description: '受控展开项。' },
  { name: 'defaultValue', type: 'string | string[]', default: '-', description: '非受控初始展开项。' },
  { name: 'onValueChange', type: '(value) => void', default: '-', description: '展开项变化回调。' },
  { name: 'collapsible', type: 'boolean', default: 'false', description: '`single` 模式下是否允许全部收起。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用整个折叠组。' }
]"/>

### AccordionItem

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '项唯一标识，必填。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用当前项。' },
  { name: 'className', type: 'string', default: '-', description: '项容器样式扩展。' }
]"/>

### AccordionTrigger / AccordionContent

<DataTable preset="props" :data="[
  { name: 'asChild', type: 'boolean', default: 'false', description: '将行为与样式注入子元素。' },
  { name: 'className', type: 'string', default: '-', description: '触发器或内容区样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '标题内容或折叠内容。' },
  { name: 'forceMount', type: 'boolean', default: 'false', description: '内容区是否在关闭时仍挂载。' }
]"/>

## A11y

- `AccordionTrigger` 默认支持键盘操作与 `aria-expanded` 语义。
- 保证 trigger 文本能独立表达该分组内容，不要仅用图标。
- 对长内容建议分段，避免展开后形成大段难读文本。

## 常见问题 (FAQ)

### 如何实现“默认展开多项”？

将 `type` 设为 `multiple`，并通过 `defaultValue` 传入数组。

```tsx
<Accordion type="multiple" defaultValue={["a", "b"]} />
```

### 为什么 `single` 模式下无法全部收起？

默认 `single` 必须保留一项展开，若需要全收起请开启 `collapsible`。
