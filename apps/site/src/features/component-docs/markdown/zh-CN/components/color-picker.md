用于选择十六进制颜色值，支持原生颜色面板、手动输入和预设色板。

源码位置：`packages/ui/color-picker.tsx`

## 何时使用

`ColorPicker` 适合主题色、标签色、图表配色等颜色输入场景。

- 主题配置中的主色选择
- 标签、状态点颜色自定义
- 图表或看板的视觉映射色设置

不建议使用场景：

- 需要复杂调色能力（HSLA、渐变、吸管）时

## 代码演示

### 基础颜色选择

```playground
basic
```

### 预设色板

```playground
presets
```

### 仅色板模式

```playground
no-input
```

## 属性说明 (API)

### ColorPicker

<DataTable preset="props" :data="[
  { name: 'value / defaultValue', type: 'string', default: '#1677ff', description: '受控/非受控颜色值（支持 `#RGB`/`#RRGGBB`）。' },
  { name: 'onChange', type: '(color: string) => void', default: '-', description: '颜色变化回调。' },
  { name: 'presets', type: 'string[]', default: '-', description: '预设颜色列表。' },
  { name: 'showInput', type: 'boolean', default: 'true', description: '是否显示手动输入框。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用状态。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ColorPickerProps', value: 'value/defaultValue + onChange + presets + showInput + disabled' },
  { name: 'normalizeHexColor', value: '内部仅接受合法十六进制值并标准化为 `#RRGGBB`' }
]"/>

## A11y

- 原生 `<input type="color">` 已提供基础可访问语义。
- 仅图形色块难以读屏，建议同步显示当前颜色文本值。
- 禁用态应同时体现视觉降级与交互禁止。

## 常见问题 (FAQ)

### 支持 `#fff` 这种三位写法吗？

支持，组件会自动归一化为六位十六进制值。

### 手动输入非法颜色会怎样？

失焦或回车时若格式不合法，不会触发值更新。
