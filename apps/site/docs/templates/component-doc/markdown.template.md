用于描述 __COMPONENT_NAME__ 的核心价值。

源码位置：`__DOCS_PATH__`

> 注意：标题请单独成段（标题前后保留空行），保证页内导航锚点稳定。

## 何时使用

请给出组件适用场景与边界说明。

- 推荐场景 A
- 推荐场景 B
- 推荐场景 C

不建议使用场景：

- 不建议场景 A

## 代码演示

```playground
basic-usage
form-integration
```

## 属性说明 (API)

> `DataTable :data` 仅支持字面量数组对象，禁止使用函数调用或变量表达式。

<DataTable preset="props" :data="[
  { name: 'propA', type: 'string', default: '-', description: '属性说明 A。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '是否禁用。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式类。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: '__COMPONENT_NAME__Variant', value: `'default' | 'outline'` }
]"/>

## FAQ

### 如何与表单配合？

请给出最小可执行示例。

```tsx
// TODO: 填写示例
```

### 如何自定义样式？

请说明推荐的扩展方式，不建议覆盖基础结构样式。
