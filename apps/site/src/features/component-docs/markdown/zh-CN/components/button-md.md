用于触发即时操作，是页面中的核心交互入口。

源码位置：`packages/ui/button.tsx`

## 何时使用

标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应业务逻辑。

在 Ideal Frontbase 中我们提供了五种按钮类型：

- **主按钮 (Primary)**：用于主行动点，一个操作区域建议只有一个主按钮。
- **默认按钮 (Secondary)**：用于没有强主次之分的一组行动点。
- **虚线按钮 (Dashed)**：常用于“添加”一类弱强调操作。
- **文本按钮 (Text/Link)**：用于页面内次级跳转或补充动作。
- **链接按钮 (Link)**：用于承担导航语义的交互。

实践建议：

- 操作语义明确：主操作用 `solid`，次操作用 `outline / ghost / pure`。
- 按钮文本使用动词短语，避免歧义文案。
- 异步提交优先使用 `ButtonLoading`，避免重复点击。

## 代码演示

统一采用 playground 约定渲染示例预览、源码与复制能力。

### 颜色

```playground
color
```

### 变体

```playground
variant
```

### 尺寸

```playground
size
```

### 形状

```playground
shape
```

### 阴影

```playground
shadow
```

### 前后插槽

```playground
slot
```

### 禁用状态

```playground
disabled
```

### 加载态

```playground
loading
```

### 图标按钮

```playground
icon
```

### 链接按钮

```playground
link
```

### 按钮组

```playground
group
```

## 属性说明 (API)

### Button

<DataTable preset="props" :data="[
  { name: 'color', type: 'ButtonColor | (string & {})', default: `'primary'`, description: '按钮颜色；非内置值会回退为 primary。' },
  { name: 'variant', type: 'ButtonVariant', default: `'solid'`, description: '控制按钮语义与视觉样式。' },
  { name: 'size', type: 'ButtonSize', default: `'md'`, description: '控制按钮尺寸和内边距。' },
  { name: 'shape', type: 'ButtonShape', default: `'auto'`, description: '控制按钮外轮廓形状。' },
  { name: 'shadow', type: 'ButtonShadow', default: `'none'`, description: '控制按钮阴影层级。' },
  { name: 'fitContent', type: 'boolean', default: 'false', description: '按内容自适应尺寸。' },
  { name: 'leading', type: 'ReactNode', default: '-', description: '按钮前置内容。' },
  { name: 'trailing', type: 'ReactNode', default: '-', description: '按钮后置内容。' },
  { name: 'asChild', type: 'boolean', default: 'false', description: '将样式注入子组件。' },
  { name: 'type', type: `'button' | 'submit' | 'reset'`, default: '-', description: '未显式设置时遵循原生 button 默认行为（submit）。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用点击与键盘触发。' }
]"/>

### ButtonIcon

<DataTable preset="props" :data="[
  { name: 'icon', type: 'ReactNode', default: '-', description: '图标内容，必传。', required: true }
]"/>

> 继承 `Button` 的样式属性（`variant/color/size/shape/shadow` 等）。

### ButtonLoading

<DataTable preset="props" :data="[
  { name: 'loading', type: 'boolean', default: 'false', description: '受控加载状态。' },
  { name: 'autoLoading', type: 'boolean', default: 'false', description: '点击处理期间自动进入加载。' },
  { name: 'loadingText', type: 'ReactNode', default: '-', description: '当 loadingPosition=center 时显示。' },
  { name: 'loadingDuration', type: 'number', default: '-', description: '自动加载结束延迟（毫秒）。' },
  { name: 'loadingIcon', type: 'ReactNode', default: '<Spinner />', description: '加载图标；默认使用 Spinner。' },
  { name: 'loadingPosition', type: `'start' | 'center' | 'end'`, default: `'start'`, description: '加载图标位置。' },
  { name: 'children', type: 'ReactNode | ((context: { loading: boolean }) => ReactNode)', default: '-', description: '支持渲染函数读取 loading 状态。' },
  { name: 'onClick', type: '(event: React.MouseEvent<HTMLButtonElement>) => unknown', default: '-', description: '点击回调；autoLoading 会等待异步结果。' }
]"/>

> 继承 `Button` 的样式属性（`variant/color/size/shape/shadow` 等）。

### ButtonLink

<DataTable preset="props" :data="[
  { name: 'to', type: 'string', default: '-', description: '站内路由目标。' },
  { name: 'href', type: 'string', default: '-', description: '外部链接地址。' },
  { name: 'external', type: 'boolean', default: '-', description: '强制声明按外链/内链处理。' },
  { name: 'target', type: 'string', default: '-', description: '链接打开方式。' },
  { name: 'rel', type: 'string', default: '-', description: '链接 rel。' },
  { name: 'noRel', type: 'boolean', default: 'false', description: '禁用外链默认 rel（noopener noreferrer）。' },
  { name: 'prefetch', type: 'boolean', default: '-', description: '站内链接预取。' },
  { name: 'noPrefetch', type: 'boolean', default: '-', description: '禁用站内链接预取。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用链接交互。' },
  { name: 'children', type: 'ReactNode | ((context: { isHref: boolean }) => ReactNode)', default: '-', description: '支持根据是否外链渲染内容。' }
]"/>

> 继承 `Button` 的样式属性（`variant/color/size/shape/shadow` 等）。

### ButtonGroup

<DataTable preset="props" :data="[
  { name: 'orientation', type: `'horizontal' | 'vertical'`, default: `'horizontal'`, description: '组方向。' },
  { name: 'dir', type: `'ltr' | 'rtl'`, default: `'ltr'`, description: '文本方向。' },
  { name: 'color', type: 'ButtonColor', default: '-', description: '组级颜色，向子按钮透传。' },
  { name: 'size', type: 'ButtonSize', default: '-', description: '组级尺寸，向子按钮透传。' },
  { name: 'variant', type: 'ButtonVariant', default: '-', description: '组级变体，向子按钮透传。' },
  { name: 'shape', type: 'ButtonShape', default: '-', description: '组级形状，向子按钮透传。' },
  { name: 'shadow', type: 'ButtonShadow', default: '-', description: '组级阴影，向子按钮透传。' },
  { name: 'fitContent', type: 'boolean', default: '-', description: '组级内容自适应，向子按钮透传。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用整个分组。' }
]"/>

> `ButtonGroup` 会将组级样式上下文传递给内部按钮。

## 状态指南

用于校准按钮在关键交互节点中的语义表达与可访问行为。

```playground
state-guide
```

## 尺寸变体

同一页面内建议保持 1 到 2 种主尺寸，避免层级混乱。

```playground
size-variants
```

## 样式变量 (Theme)

通过语义化 CSS 变量调整按钮视觉风格；优先使用主题令牌，不建议在业务代码中硬编码颜色。

```playground
theme-variables
```

<DataTable :data="[
  { name: '--primary', description: 'Default / Solid 主按钮背景与前景色', token: 'bg-primary / bg-primary-foreground' },
  { name: '--secondary', description: 'Secondary 语义色与前景色', token: 'bg-secondary / bg-secondary-foreground' },
  { name: '--destructive', description: '危险操作背景与前景色', token: 'bg-destructive / bg-destructive-foreground' },
  { name: '--accent', description: 'Ghost / Outline 悬停态背景', token: 'bg-accent / bg-accent-foreground' },
  { name: '--muted', description: '禁用态背景与次要文本', token: 'bg-muted / bg-muted-foreground' },
  { name: '--ring', description: 'Focus-visible 聚焦环颜色', token: 'bg-ring' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ButtonColor', value: `'primary' | 'destructive' | 'success' | 'warning' | 'info' | 'carbon' | 'secondary' | 'accent'` },
  { name: 'ButtonSize', value: `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'default' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'` },
  { name: 'ButtonVariant', value: `'solid' | 'pure' | 'plain' | 'default' | 'destructive' | 'outline' | 'dashed' | 'soft' | 'secondary' | 'ghost' | 'link'` },
  { name: 'ButtonShape', value: `'auto' | 'rounded' | 'square' | 'circle'` },
  { name: 'ButtonShadow', value: `'none' | 'sm' | 'md' | 'lg'` }
]"/>

## 常见问题 (FAQ)

### 如何作为链接使用？

使用 `asChild` 并将 `BaseLink` 作为直接子元素：

```tsx
<Button asChild>
  <BaseLink to="/components/button">Go Button</BaseLink>
</Button>
```

### 如何修改圆角？

在 `globals.css` 中调整 `--radius` 变量，它会统一影响 Button、Card、Input 等组件。
