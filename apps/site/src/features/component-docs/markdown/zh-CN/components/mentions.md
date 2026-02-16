用于在文本输入中通过触发字符（如 `@`、`#`）快速插入候选对象。

源码位置：`packages/ui/mentions.tsx`

## 何时使用

`Mentions` 适合评论、协作通知、任务分派等需要“提及对象”的输入场景。

- 评论中 @成员
- 工单中 #团队
- 文本中插入结构化引用对象

不建议使用场景：

- 纯自由文本输入且没有提及需求

## 代码演示

### 基础提及

```playground
basic
```

### 自定义渲染与触发符

```playground
custom-render
```

### 受控模式

```playground
controlled
```

## 属性说明 (API)

### Mentions

<DataTable preset="props" :data="[
  { name: 'options', type: 'MentionOption[]', default: '-', description: '候选项列表。', required: true },
  { name: 'value', type: 'string', default: '-', description: '受控输入值。' },
  { name: 'defaultValue', type: 'string', default: '', description: '非受控初始值。' },
  { name: 'onChange', type: 'value callback', default: '-', description: '内容变化回调。' },
  { name: 'trigger', type: 'string', default: '@', description: '提及触发符。' },
  { name: 'onSearch', type: 'keyword callback', default: '-', description: '搜索关键字变化回调。' },
  { name: 'onOptionSelect', type: 'option callback', default: '-', description: '选中候选项回调。' },
  { name: 'maxSuggestions', type: 'number', default: '8', description: '最多展示候选项数量。' },
  { name: 'renderOption', type: 'render callback', default: '-', description: '自定义候选项渲染。' },
  { name: 'notFoundContent', type: 'ReactNode', default: '无匹配项', description: '空状态内容。' },
  { name: 'dropdownClassName', type: 'string', default: '-', description: '下拉层样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'MentionOption', value: '{ value: string; label?: ReactNode; keywords?: string[]; disabled?: boolean }' }
]"/>

## FAQ

### 如何从 `@` 切换到 `#` 触发？

将 `trigger` 改为 `#` 即可。

### 如何实现服务端候选搜索？

使用 `onSearch` 获取关键字，请求接口后更新 `options`。
