用于在容器上叠加文本或图片水印，支持旋转、间距、偏移与篡改观察。

源码位置：`packages/ui/watermark.tsx`

## 何时使用

`Watermark` 适合需要防泄漏标记或版权标记的页面。

- 内部报表与运营后台页面
- 截图追踪（标记团队、环境、用户）
- 资料预览与文档保护

不建议使用场景：

- 小尺寸交互组件内部（会影响可读性）

## 代码演示

### 基础文本水印

```playground
basic
```

### 多行水印

```playground
multi-line
```

### 自定义参数

```playground
custom
```

## 属性说明 (API)

### Watermark

<DataTable preset="props" :data="[
  { name: 'content', type: 'string | string[]', default: 'CONFIDENTIAL', description: '文本水印内容，支持多行。' },
  { name: 'image', type: 'string', default: '-', description: '图片水印 URL；有值时优先使用图片。' },
  { name: 'rotate', type: 'number', default: '-20', description: '旋转角度（度）。' },
  { name: 'gap', type: '[number, number]', default: '[160, 128]', description: '水印平铺间距。' },
  { name: 'offset', type: '[number, number]', default: '[0, 0]', description: '水印绘制偏移。' },
  { name: 'opacity', type: 'number', default: '0.15', description: '透明度。' },
  { name: 'font', type: 'WatermarkFont', default: '-', description: '文本字体配置。' },
  { name: 'zIndex', type: 'number', default: '20', description: '水印层级。' },
  { name: 'observe', type: 'boolean', default: 'true', description: '是否观察并修复水印层被篡改。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '被加水印的内容。' }
]"/>

### WatermarkFont

<DataTable preset="props" :data="[
  { name: 'color', type: 'string', default: 'hsl(var(--foreground) / 0.45)', description: '文字颜色。' },
  { name: 'fontSize', type: 'number', default: '14', description: '字号。' },
  { name: 'fontFamily', type: 'string', default: 'ui-sans-serif, system-ui, sans-serif', description: '字体族。' },
  { name: 'fontWeight', type: 'number | string', default: '500', description: '字重。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'WatermarkProps', value: 'content/image + rotate/gap/offset/opacity + font/zIndex/observe' },
  { name: 'WatermarkFont', value: '{ color?; fontSize?; fontFamily?; fontWeight? }' }
]"/>

## A11y

- 水印层默认 `pointer-events: none`，不会阻断内容交互。
- 水印不应替代权限控制，仅作为视觉补充。
- 透明度与间距需平衡可读性，避免影响正文识别。

## 常见问题 (FAQ)

### 如何改成图片水印？

设置 `image`，组件会优先绘制图片并忽略文本 `content`。

### `observe` 有什么作用？

开启后会监听水印层样式/节点变化，发现被移除或篡改时自动恢复。
