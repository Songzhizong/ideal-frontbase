用于一次性验证码（OTP）输入，提供分槽位输入、聚焦移动和视觉分组能力。

源码位置：`packages/ui/input-otp.tsx`

## 何时使用

`InputOTP` 适合短信验证码、二次验证口令等固定长度输入。

- 登录二次验证
- 支付确认码输入
- 邀请码或设备绑定码输入

不建议使用场景：

- 非固定长度的普通文本输入

## 代码演示

### 基础六位验证码

```playground
basic
```

### 受控模式

```playground
controlled
```

### 禁用状态

```playground
disabled
```

## 属性说明 (API)

### InputOTP

<DataTable preset="props" :data="[
  { name: 'maxLength', type: 'number', default: '-', description: '验证码长度。' },
  { name: 'value', type: 'string', default: '-', description: '受控输入值。' },
  { name: 'onChange', type: 'value callback', default: '-', description: '值变化回调。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用输入。' },
  { name: 'containerClassName', type: 'string', default: '-', description: '输入组容器样式。' },
  { name: 'className', type: 'string', default: '-', description: '输入根节点样式。' }
]"/>

### InputOTPSlot

<DataTable preset="props" :data="[
  { name: 'index', type: 'number', default: '-', description: '槽位索引，从 0 开始。', required: true },
  { name: 'className', type: 'string', default: '-', description: '槽位样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '通常不需要手动传入。' }
]"/>

### InputOTPGroup / InputOTPSeparator

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '分组或分隔符样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '分组内容。' },
  { name: '用途', type: '-', default: '-', description: '用于组织多个 OTP 槽位。' }
]"/>

## FAQ

### 如何做 3-3 分段展示？

使用两个 `InputOTPGroup`，中间插入 `InputOTPSeparator`。

### 如何在提交后清空验证码？

使用受控模式，提交后将 `value` 置为空字符串即可。
