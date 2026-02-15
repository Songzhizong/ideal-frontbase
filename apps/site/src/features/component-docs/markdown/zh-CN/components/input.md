通过鼠标或键盘输入内容，是最基础的表单域的包装。

源码位置：`packages/ui/input.tsx`

## 何时使用

用于采集单行文本输入，强调可读的提示信息与可访问性语义。

推荐在以下场景使用：

- 登录表单
- 搜索输入
- 筛选条件
- 配置项编辑

实践建议：

- 必须提供标签或可访问名称，避免无语义输入框。
- 输入错误时配合错误提示与状态边框展示。
- 搜索类输入建议加防抖逻辑，避免频繁请求。

## 代码演示

统一采用 playground 约定渲染示例预览、源码与复制能力。

```playground
basic
search-field
```

## 属性说明 (API)

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `'text'` | 原生输入类型，如 `text` / `password` / `email`。 |
| `placeholder` | `string` | `-` | 输入提示文本。 |
| `disabled` | `boolean` | `false` | 禁用输入。 |

## 状态指南

### 默认状态

用于常规可编辑输入场景。

```playground
state-default
```

### 禁用状态 (Disabled)

权限不足或当前流程不可修改时使用。

```playground
state-disabled
```

### 错误状态 (Invalid)

校验失败时通过语义属性与错误文案联合提示。

```playground
state-invalid
```

## 常见问题 (FAQ)

### 如何增加搜索图标？

在外层使用 `relative` 容器，图标绝对定位到输入框左侧。

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input className="pl-9" />
</div>
```

### 如何表达校验失败？

设置 `aria-invalid` 并在输入框下方提供可见错误提示文案。

```tsx
<Input aria-invalid />
<p className="text-destructive text-xs">请输入正确格式</p>
```
