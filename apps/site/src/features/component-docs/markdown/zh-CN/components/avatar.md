用于展示用户或实体头像，支持图片加载、回退文案、状态角标和群组叠放。

源码位置：`packages/ui/avatar.tsx`

## 何时使用

`Avatar` 用于在紧凑空间内快速建立身份识别。

- 用户列表、评论区、会话面板
- 协作成员头像组展示
- 在线状态/认证状态角标提示

不建议使用场景：

- 大尺寸媒体展示（建议使用 `Image`）

## 代码演示

### 尺寸与回退

```playground
size-and-fallback
```

### 在线状态角标

```playground
with-badge
```

### 群组叠放

```playground
group-stack
```

## 属性说明 (API)

### Avatar

<DataTable preset="props" :data="[
  { name: 'size', type: `'default' | 'sm' | 'lg'`, default: `'default'`, description: '头像尺寸。' },
  { name: 'className', type: 'string', default: '-', description: '自定义容器样式。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '通常包含 AvatarImage / AvatarFallback / AvatarBadge。' }
]"/>

### AvatarImage

<DataTable preset="props" :data="[
  { name: 'src', type: 'string', default: '-', description: '头像图片地址。' },
  { name: 'alt', type: 'string', default: '-', description: '替代文本。' },
  { name: 'className', type: 'string', default: '-', description: '自定义图片样式。' }
]"/>

### AvatarFallback / AvatarBadge / AvatarGroup

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '回退文本、角标内容或群组子节点。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式类。' },
  { name: '...divProps', type: 'React.ComponentProps<"div">', default: '-', description: '其余原生 div 属性。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'AvatarSize', value: `'default' | 'sm' | 'lg'` }
]"/>

## FAQ

### 图片加载失败后如何处理？

将首字母或昵称写入 `AvatarFallback` 作为兜底。

```tsx
<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
</Avatar>
```

### 如何展示“更多成员”计数？

在 `AvatarGroup` 末尾添加 `AvatarGroupCount`。
