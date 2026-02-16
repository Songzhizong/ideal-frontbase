用于表示进行中的异步状态，帮助用户理解“操作正在处理”。

源码位置：`packages/ui/spinner.tsx`

## 何时使用

`Spinner` 适合短时等待态，常用于按钮、区域加载和轮询状态。

- 提交按钮加载中
- 局部模块数据获取中
- 轮询刷新中的状态提示

不建议使用场景：

- 长耗时任务且需要明确进度（建议使用 `Progress`）

## 代码演示

### 尺寸变化

```playground
size
```

### 与文案/按钮联用

```playground
inline-with-text
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '控制尺寸、颜色和间距。' },
  { name: 'role', type: 'string', default: `'status'`, description: '可访问语义角色。' },
  { name: 'aria-label', type: 'string', default: `'Loading'`, description: '屏幕阅读器提示文案。' }
]"/>

## FAQ

### 如何让 Spinner 和按钮文案对齐？

在按钮内使用 `inline-flex` 布局并给 `Spinner` 添加右侧间距。

### 可以直接改成品牌色吗？

可以，通过 `className` 传入语义化颜色类，不要写硬编码颜色值。
