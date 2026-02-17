用于生成二维码并提供下载、过期刷新、加载状态展示能力。

源码位置：`packages/ui/qr-code.tsx`

## 何时使用

`QRCode` 适合扫码登录、分享链接、设备绑定等二维码场景。

- 登录二维码、授权二维码
- 链接分享与下载入口
- 临时凭证（可过期刷新）展示

不建议使用场景：

- 强交互表单输入（二维码只负责承载值，不负责交互流程）

## 代码演示

### 基础二维码

```playground
basic
```

### 带中心图标与下载

```playground
with-icon-download
```

### 状态与刷新

```playground
status
```

## 属性说明 (API)

### QRCode

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '二维码内容，必填。' },
  { name: 'size', type: 'number', default: '160', description: '二维码尺寸（px）。' },
  { name: 'icon', type: 'string | ReactNode', default: '-', description: '中心图标或图片。' },
  { name: 'color / backgroundColor', type: 'string', default: '#000000 / #ffffff', description: '二维码前景色与背景色。' },
  { name: 'errorLevel', type: 'L | M | Q | H', default: 'M', description: '纠错等级。' },
  { name: 'status', type: 'active | loading | expired', default: 'active', description: '展示状态。' },
  { name: 'onRefresh', type: '() => void', default: '-', description: '过期状态点击刷新回调。' },
  { name: 'downloadable', type: 'boolean', default: 'true', description: '是否显示下载按钮。' },
  { name: 'fileName', type: 'string', default: 'qrcode.png', description: '下载文件名。' },
  { name: 'downloadLabel', type: 'ReactNode', default: '下载二维码', description: '下载按钮文案。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'QRCodeErrorLevel', value: 'L | M | Q | H' },
  { name: 'QRCodeStatus', value: 'active | loading | expired' },
  { name: 'QRCodeProps', value: 'value + size/icon/color/status + download config' }
]"/>

## A11y

- 二维码仅是视觉载体，建议旁边提供可复制的文本链接。
- 过期状态需有明确可见动作（如“刷新”）。
- 下载按钮文案应表达结果（如“下载二维码”而非“操作”）。

## 常见问题 (FAQ)

### 二维码过期后如何刷新？

将 `status` 设为 `expired` 并实现 `onRefresh` 回调，在回调中更新 `value`。

### 可以隐藏下载按钮吗？

设置 `downloadable={false}` 即可。
