用于一键复制文本到剪贴板，提供复制状态反馈与可组合的文本复制展示。

源码位置：`packages/ui/copy-button.tsx`

## 何时使用

`CopyButton` / `CopyText` 适合复制链接、令牌、命令、ID 等短文本。

- API 地址、访问令牌、项目 ID 复制
- 命令行片段复制（curl / SQL / CLI）
- 只读配置值旁的快捷复制动作

不建议使用场景：

- 大段富文本复制（建议提供代码块复制组件）

## 代码演示

### 基础按钮复制

```playground
basic
```

### 仅图标复制按钮

```playground
icon-only
```

### 文本 + 复制按钮组合

```playground
copy-text
```

### 复制回调处理

```playground
callback
```

## 属性说明 (API)

### CopyButton

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '待复制文本，必填。' },
  { name: 'timeout', type: 'number', default: '-', description: '复制成功态持续时间（毫秒）。' },
  { name: 'onCopy', type: '(value: string, copied: boolean) => void | Promise<void>', default: '-', description: '复制完成回调。' },
  { name: 'copyLabel', type: 'ReactNode', default: '复制', description: '未复制时文案。' },
  { name: 'copiedLabel', type: 'ReactNode', default: '已复制', description: '复制成功后文案。' },
  { name: 'iconOnly', type: 'boolean', default: 'false', description: '仅显示图标；会自动输出 `sr-only` 文案。' },
  { name: '...props', type: 'Omit<ButtonProps, "onCopy">', default: '-', description: '透传 Button 属性（variant/size/disabled 等）。' }
]"/>

### CopyText

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '待复制文本，必填。' },
  { name: 'text', type: 'ReactNode', default: 'value', description: '展示文本；不传时显示 value。' },
  { name: 'truncate', type: 'boolean', default: 'true', description: '是否截断展示文本。' },
  { name: 'timeout', type: 'number', default: '-', description: '内部 CopyButton 的超时时长。' },
  { name: 'onCopy', type: '(value: string, copied: boolean) => void | Promise<void>', default: '-', description: '复制完成回调。' },
  { name: 'textClassName', type: 'string', default: '-', description: '文本样式扩展。' },
  { name: 'buttonClassName', type: 'string', default: '-', description: '复制按钮样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'CopyButtonProps', value: 'Omit<ButtonProps, "onCopy"> & { value, timeout?, onCopy?, copyLabel?, copiedLabel?, iconOnly? }' },
  { name: 'CopyTextProps', value: 'Omit<React.ComponentProps<"div">, "onCopy"> & { value, text?, timeout?, onCopy?, truncate?, textClassName?, buttonClassName? }' }
]"/>

## A11y

- `iconOnly` 模式会输出 `sr-only` 文案，仍建议显式提供 `copyLabel`。
- 复制内容建议在界面可见，避免“点击但不知道复制了什么”。
- 对失败场景可在 `onCopy` 中提供可见反馈（例如错误提示）。

## 常见问题 (FAQ)

### 如何在复制成功后执行额外逻辑？

使用 `onCopy` 回调读取 `copied` 结果。

```tsx
<CopyButton value="foo" onCopy={(_value, copied) => copied && track("copied")} />
```

### 如何展示“可截断文本 + 复制”组合？

直接使用 `CopyText`，默认开启文本截断并附带图标按钮。
