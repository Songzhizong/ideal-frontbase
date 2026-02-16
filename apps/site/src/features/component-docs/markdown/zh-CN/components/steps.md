用于表达流程进度，支持横向/纵向布局、状态标识和步骤跳转。

源码位置：`packages/ui/steps.tsx`

## 何时使用

`Steps` 适合描述“按顺序推进”的任务过程。

- 向导流程进度
- 发布流水线状态
- 审批节点展示

不建议使用场景：

- 无顺序关系的普通列表信息

## 代码演示

### 基础进度

```playground
basic
```

### 状态展示

```playground
statuses
```

### 可点击切换

```playground
clickable
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'items', type: 'StepsItem[]', default: '-', description: '步骤项列表。', required: true },
  { name: 'current', type: 'number', default: '0', description: '当前步骤索引。' },
  { name: 'direction', type: 'horizontal | vertical', default: 'horizontal', description: '方向布局。' },
  { name: 'status', type: 'wait | process | finish | error', default: 'process', description: '当前步骤默认状态。' },
  { name: 'onStepChange', type: 'index callback', default: '-', description: '点击步骤时回调。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'StepsDirection', value: 'horizontal | vertical' },
  { name: 'StepsStatus', value: 'wait | process | finish | error' },
  { name: 'StepsItem', value: '{ title: ReactNode; description?: ReactNode; icon?: ReactNode; status?: StepsStatus; disabled?: boolean }' }
]"/>

## FAQ

### 步骤状态如何覆盖自动推导？

在单个 `items` 项上设置 `status`，会优先于自动状态。

### 如何让步骤可点击回退？

传入 `onStepChange` 并在回调中更新 `current`。
