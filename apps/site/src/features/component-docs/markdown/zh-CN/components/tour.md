用于分步骤引导用户完成首次操作，支持目标高亮、遮罩、方向定位与流程控制。

源码位置：`packages/ui/tour.tsx`

## 何时使用

`Tour` 适合“首次进入、功能上线、流程改版”这类需要逐步说明的场景。

- 新功能上线后的上手引导
- 多步骤操作流程的关键节点说明
- 页面改版后对核心入口做一次性教学

不建议使用场景：

- 高频重复展示的提示（会造成打扰，建议改为内联说明或 Tooltip）

## 代码演示

### 基础引导

```playground
basic
```

### 定位差异演示

```playground
placements
```

### 受控模式

```playground
controlled
```

### 带封面内容

```playground
with-cover
```

## 属性说明 (API)

### Tour

<DataTable preset="props" :data="[
  { name: 'steps', type: 'TourStep[]', default: '-', description: '引导步骤列表，必填。' },
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: '非受控初始打开状态。' },
  { name: 'onOpenChange', type: '(open: boolean) => void', default: '-', description: '打开状态变化回调。' },
  { name: 'current', type: 'number', default: '-', description: '受控当前步骤索引。' },
  { name: 'defaultCurrent', type: 'number', default: '0', description: '非受控初始步骤索引。' },
  { name: 'onCurrentChange', type: '(index: number) => void', default: '-', description: '步骤变化回调。' },
  { name: 'maskClosable', type: 'boolean', default: 'true', description: '点击遮罩是否可关闭引导。' },
  { name: 'showProgress', type: 'boolean', default: 'true', description: '是否显示步骤进度（如 `1 / 3`）。' },
  { name: 'onClose', type: '() => void', default: '-', description: '手动关闭时回调。' },
  { name: 'onFinish', type: '() => void', default: '-', description: '最后一步点击完成时回调。' }
]"/>

### TourStep

<DataTable preset="props" :data="[
  { name: 'key', type: 'React.Key', default: '-', description: '步骤唯一标识（推荐提供）。' },
  { name: 'target', type: 'string | HTMLElement | () => HTMLElement | null', default: '-', description: '高亮目标；支持选择器、元素实例或函数。' },
  { name: 'title', type: 'ReactNode', default: '-', description: '步骤标题。' },
  { name: 'description', type: 'ReactNode', default: '-', description: '步骤说明。' },
  { name: 'placement', type: 'top | right | bottom | left | center', default: 'bottom', description: '引导卡放置方向。' },
  { name: 'maskPadding', type: 'number', default: '8', description: '高亮区域外扩像素。' },
  { name: 'nextText', type: 'ReactNode', default: '下一步 / 完成', description: '下一步按钮文案。' },
  { name: 'prevText', type: 'ReactNode', default: '上一步', description: '上一步按钮文案。' },
  { name: 'cover', type: 'ReactNode', default: '-', description: '引导卡顶部封面内容。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'TourPlacement', value: 'top | right | bottom | left | center' },
  { name: 'TourStep', value: '{ key?, target, title, description?, placement?, maskPadding?, nextText?, prevText?, cover? }' },
  { name: 'TourProps', value: 'TourStep[] + open/current 双模式控制 + close/finish 回调' }
]"/>

## A11y

- 支持 `Esc` 关闭；若流程不允许中断可将 `maskClosable` 设为 `false` 并配合业务提示。
- 目标元素应保证可见且有明确语义，否则用户难以理解当前步骤。
- 引导文案建议短句化，单步只说明一个关键动作。

## 常见问题 (FAQ)

### `target` 未命中时会发生什么？

该步骤不会出现高亮框，但引导卡仍会显示。建议在打开引导前确认目标已渲染。

### 如何实现“外部控制步骤跳转”？

使用受控模式：传入 `current` 与 `onCurrentChange`，在外部按钮中更新索引。

```tsx
<Tour current={current} onCurrentChange={setCurrent} steps={steps} />
```
