用于评分输入，支持整星、半星、清空和键盘交互。

源码位置：`packages/ui/rate.tsx`

## 何时使用

`Rate` 适合对服务、内容或体验进行快速打分。

- 用户满意度评分
- 文章/课程评分
- 质量评审分值录入

不建议使用场景：

- 需要细粒度数值输入（建议用 `Slider` 或 `Input`）

## 代码演示

### 基础评分

```playground
basic
```

### 半星与可清空

```playground
half-and-clear
```

### 禁用状态

```playground
disabled
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'value', type: 'number', default: '-', description: '受控评分值。' },
  { name: 'defaultValue', type: 'number', default: '0', description: '非受控初始评分。' },
  { name: 'onChange', type: 'value callback', default: '-', description: '评分变化回调。' },
  { name: 'count', type: 'number', default: '5', description: '星星数量。' },
  { name: 'allowHalf', type: 'boolean', default: 'false', description: '是否允许半星。' },
  { name: 'allowClear', type: 'boolean', default: 'true', description: '再次点击是否清空。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用评分。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' }
]"/>

## FAQ

### 如何禁用“再次点击清空”？

将 `allowClear` 设为 `false`。

### 如何支持键盘调节评分？

组件已内置方向键支持，聚焦星标后可用方向键增减分值。
