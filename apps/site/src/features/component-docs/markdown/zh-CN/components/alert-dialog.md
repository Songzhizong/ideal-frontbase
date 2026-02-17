用于危险操作或关键确认场景，要求用户明确确认/取消。

源码位置：`packages/ui/alert-dialog.tsx`

## 何时使用

`AlertDialog` 适合会造成不可逆影响的关键动作确认。

- 删除资源
- 重置密钥/密码
- 退出未保存流程

不建议使用场景：

- 普通信息展示或非关键确认（建议用 `Dialog`）

## 代码演示

### 基础确认弹窗

```playground
basic
```

### 带媒体区域

```playground
with-media
```

### 小尺寸模式

```playground
small-size
```

## 属性说明 (API)

### AlertDialog

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: '-', description: '非受控初始状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '打开状态回调。' }
]"/>

### AlertDialogContent

<DataTable preset="props" :data="[
  { name: 'size', type: 'default | sm', default: 'default', description: '内容宽度规格。' },
  { name: 'className', type: 'string', default: '-', description: '内容样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '弹窗主体内容。' }
]"/>

### AlertDialogAction / AlertDialogCancel

<DataTable preset="props" :data="[
  { name: 'variant', type: 'ButtonVariant', default: 'Action=solid / Cancel=outline', description: '按钮样式。' },
  { name: 'color', type: 'ButtonColor', default: 'Action=primary', description: 'Action 按钮语义色。' },
  { name: 'size', type: 'ButtonSize', default: 'md', description: '按钮尺寸。' },
  { name: 'className', type: 'string', default: '-', description: '按钮样式扩展。' }
]"/>

### 结构组件

<DataTable preset="props" :data="[
  { name: 'AlertDialogHeader/Footer', type: '-', default: '-', description: '头部和底部布局容器。' },
  { name: 'AlertDialogTitle/Description', type: '-', default: '-', description: '标题和描述文案。' },
  { name: 'AlertDialogMedia', type: '-', default: '-', description: '图标或插图区域。' }
]"/>

## FAQ

### 如何做危险确认主按钮？

给 `AlertDialogAction` 传 `color='destructive'`（`variant` 保持 `solid`）。

### 为什么推荐双按钮结构？

关键操作必须提供可撤销路径，避免误触造成不可逆后果。
