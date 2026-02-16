用于开关型状态切换，表达“开启/关闭”二元状态。

源码位置：`packages/ui/switch.tsx`

## 何时使用

`Switch` 适合即时生效的状态切换场景。

- 功能开关
- 通知偏好开关
- 系统配置项启停

不建议使用场景：

- 需要从多个选项中选择一个（建议使用 `RadioGroup`）

## 代码演示

### 尺寸

```playground
sizes
```

### 受控开关

```playground
controlled
```

### 设置列表

```playground
setting-list
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'checked', type: 'boolean', default: '-', description: '受控状态。' },
  { name: 'defaultChecked', type: 'boolean', default: '-', description: '非受控初始状态。' },
  { name: 'onCheckedChange', type: 'checked callback', default: '-', description: '状态变化回调。' },
  { name: 'size', type: 'default | sm', default: 'default', description: '开关尺寸。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用交互。' },
  { name: 'required', type: 'boolean', default: 'false', description: '是否必填。' },
  { name: 'name', type: 'string', default: '-', description: '表单字段名。' },
  { name: 'value', type: 'string', default: '-', description: '表单提交值。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' }
]"/>

## FAQ

### 什么时候用 `Switch` 而不是 `Checkbox`？

表达“立即切换某个功能状态”时用 `Switch`；表达“从清单中勾选若干项”时用 `Checkbox`。

### 如何展示当前状态文案？

在受控模式下根据 `checked` 渲染“开启/关闭”等状态文本。
