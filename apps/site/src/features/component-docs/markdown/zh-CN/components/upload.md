用于文件上传，支持按钮触发、拖拽上传、进度展示、失败重试与手动上传模式。

源码位置：`packages/ui/upload.tsx`

## 何时使用

`Upload` 适合需要文件选择、上传状态反馈和失败处理的业务场景。

- 头像、附件、配置文件上传
- 批量文件导入
- 表单中的资源提交与校验

不建议使用场景：

- 仅需粘贴链接地址（建议使用 `Input`）

## 代码演示

### 按钮上传（自动）

```playground
basic
```

### 拖拽上传

```playground
dragger
```

### 手动上传队列

```playground
manual
```

## 属性说明 (API)

### Upload

<DataTable preset="props" :data="[
  { name: 'onUpload', type: '(file, context) => Promise<TResponse>', default: '-', description: '上传实现函数，必填。' },
  { name: 'accept', type: 'string', default: '-', description: '允许上传的 MIME/扩展名。' },
  { name: 'multiple', type: 'boolean', default: 'false', description: '是否允许多文件。' },
  { name: 'maxSize', type: 'number', default: '-', description: '单文件大小上限（字节）。' },
  { name: 'maxCount', type: 'number', default: '-', description: '文件数量上限。' },
  { name: 'autoUpload', type: 'boolean', default: 'true', description: '是否选中文件后自动上传。' },
  { name: 'concurrency', type: 'number', default: '2', description: '并发上传数。' },
  { name: 'fileList / defaultFileList', type: 'UploadFileItem[]', default: '-', description: '受控/非受控文件列表。' },
  { name: 'onFileListChange', type: '(nextFileList) => void', default: '-', description: '文件列表变化回调。' },
  { name: 'onReject', type: '(rejectedFiles) => void', default: '-', description: '文件校验失败回调。' },
  { name: 'onRemove', type: '(file) => void | Promise<void>', default: '-', description: '移除文件回调。' },
  { name: 'triggerLabel', type: 'ReactNode', default: '上传文件', description: '触发按钮文案。' }
]"/>

### UploadDragger

<DataTable preset="props" :data="[
  { name: 'onUpload', type: '(file, context) => Promise<TResponse>', default: '-', description: '上传实现函数，必填。' },
  { name: 'title / description', type: 'ReactNode', default: '拖拽文件到此处上传 / 也可以点击选择文件', description: '拖拽区主副文案。' },
  { name: 'accept / multiple / maxSize / maxCount', type: '同 Upload', default: '-', description: '上传约束配置。' },
  { name: 'autoUpload / concurrency', type: '同 Upload', default: 'true / 2', description: '上传行为配置。' },
  { name: 'fileList / onFileListChange / onReject / onRemove', type: '同 Upload', default: '-', description: '列表与事件回调。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'UploadFileItem<TResponse>', value: '{ id; file; name; size; status; progress; error; response? }' },
  { name: 'UploadStatus', value: 'queued | uploading | success | error' },
  { name: 'UploadTaskContext', value: '{ signal; attempt; onProgress }' },
  { name: 'UseUploadOptions<TResponse>', value: '上传约束 + 回调 + onUpload' }
]"/>

## A11y

- 拖拽区支持 `Enter/Space` 打开文件选择器，保证键盘可用。
- 错误信息使用可见文案展示，避免只用颜色区分。
- 上传列表建议显示文件名与状态，便于读屏与人工核对。

## 常见问题 (FAQ)

### 如何实现“选择后不立即上传”？

设置 `autoUpload={false}`，用户可在列表中点击“开始上传”。

### 如何接入真实上传接口并展示进度？

在 `onUpload` 中调用接口，并通过 `context.onProgress(percent)` 回传进度。
