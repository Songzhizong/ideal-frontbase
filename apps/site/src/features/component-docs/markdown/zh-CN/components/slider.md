用于连续数值范围选择，支持单值和区间双滑块。

源码位置：`packages/ui/slider.tsx`

## 何时使用

`Slider` 适用于数值连续且可视化拖动更高效的输入场景。

- 音量、透明度、阈值配置
- 价格或评分区间筛选
- 进度调节

不建议使用场景：

- 精确输入复杂数字（建议使用 `Input`）

## 代码演示

### 单值滑块

```playground
single
```

### 区间滑块

```playground
range
```

### 纵向滑块

```playground
vertical
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'value', type: 'number[]', default: '-', description: '受控值，单值和区间都使用数组表达。' },
  { name: 'defaultValue', type: 'number[]', default: '-', description: '非受控初始值。' },
  { name: 'onValueChange', type: 'values callback', default: '-', description: '拖动过程中的值变化回调。' },
  { name: 'onValueCommit', type: 'values callback', default: '-', description: '拖动结束后的回调。' },
  { name: 'min', type: 'number', default: '0', description: '最小值。' },
  { name: 'max', type: 'number', default: '100', description: '最大值。' },
  { name: 'step', type: 'number', default: '1', description: '步进值。' },
  { name: 'orientation', type: 'horizontal | vertical', default: 'horizontal', description: '方向。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用交互。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式。' }
]"/>

## FAQ

### 为什么值要用数组？

该组件统一支持单值与区间模式，数组结构便于在两种模式间复用。

### 区间模式如何限制最小间隔？

可在 `onValueChange` 中对新值进行业务校验并回写受控值。
