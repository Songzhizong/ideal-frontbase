用于录入和管理标签集合，支持分隔符解析、校验、数量限制与快速删除。

源码位置：`packages/ui/tag-input.tsx`

## 何时使用

`TagInput` 适合维护关键词、标签、白名单等“字符串数组”数据。

- 文章标签维护
- 通知关键词配置
- 域名或 IP 白名单录入

不建议使用场景：

- 需要层级结构或复杂对象编辑

## 代码演示

### 基础用法

```playground
basic
```

### 校验与限制

```playground
validation
```

### 受控模式

```playground
controlled
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'value', type: 'string[]', default: '-', description: '受控标签数组。' },
  { name: 'defaultValue', type: 'string[]', default: '[]', description: '非受控初始标签。' },
  { name: 'onChange', type: 'tags callback', default: '-', description: '标签变化回调。' },
  { name: 'separator', type: 'string | string[] | RegExp', default: '逗号或换行', description: '标签分隔规则。' },
  { name: 'max', type: 'number', default: '-', description: '最多标签数量。' },
  { name: 'validateTag', type: 'validate callback', default: '-', description: '标签合法性校验。' },
  { name: 'onInvalidTag', type: 'invalid callback', default: '-', description: '非法标签回调。' },
  { name: 'placeholder', type: 'string', default: '输入后按回车或分隔符创建标签', description: '输入占位文案。' },
  { name: 'clearable', type: 'boolean', default: 'true', description: '是否显示一键清空。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用输入。' },
  { name: 'inputClassName', type: 'string', default: '-', description: '输入框样式扩展。' },
  { name: 'tagClassName', type: 'string', default: '-', description: '标签样式扩展。' }
]"/>

## FAQ

### 如何禁止重复标签？

组件默认会自动去重，相同标签不会重复添加。

### 如何支持空格作为分隔符？

将 `separator` 设为 `[' ', ',']` 等组合规则。
