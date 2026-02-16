用于小范围浮层展示，适合补充说明、轻量编辑和上下文配置。

源码位置：`packages/ui/popover.tsx`

## 何时使用

`Popover` 适合相对于触发器展示的短内容浮层。

- 快速说明
- 小型编辑面板
- 局部配置项调整

不建议使用场景：

- 长内容或复杂流程（建议用 `Dialog` / `Sheet`）

## 代码演示

### 基础说明浮层

```playground
basic
```

### 浮层内表单

```playground
with-form
```

### 对齐方式

```playground
custom-align
```

## 属性说明 (API)

### Popover

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: '-', description: '非受控初始状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '打开状态回调。' },
  { name: 'modal', type: 'boolean', default: 'false', description: '是否模态交互。' }
]"/>

### PopoverContent

<DataTable preset="props" :data="[
  { name: 'align', type: 'start | center | end', default: 'center', description: '浮层对齐。' },
  { name: 'sideOffset', type: 'number', default: '4', description: '偏移距离。' },
  { name: 'className', type: 'string', default: '-', description: '浮层样式扩展。' }
]"/>

### 结构组件

<DataTable preset="props" :data="[
  { name: 'PopoverTrigger/PopoverAnchor', type: '-', default: '-', description: '触发器和定位锚点。' },
  { name: 'PopoverHeader/Title/Description', type: '-', default: '-', description: '标题和描述结构。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '可放任意内容。' }
]"/>

## FAQ

### `Popover` 和 `Tooltip` 的区别？

`Popover` 可承载可交互内容；`Tooltip` 更适合纯说明文案。

### 如何把浮层宽度改小/改大？

通过 `PopoverContent` 的 `className` 调整宽度类。
