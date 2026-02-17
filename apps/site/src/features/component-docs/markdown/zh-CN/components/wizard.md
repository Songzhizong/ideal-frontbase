用于多步骤向导流程，内置步骤导航、逐步校验和完成态处理。

源码位置：`packages/ui/wizard.tsx`

## 何时使用

`Wizard` 适合配置流程、开通流程和分步表单。

- 新建项目向导
- 复杂表单拆分步骤提交
- 开通流程逐步引导

不建议使用场景：

- 单步即可完成的简单表单

## 代码演示

### 基础向导

```playground
basic
```

### 步骤校验

```playground
with-validation
```

### 受控步骤

```playground
controlled
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'steps', type: 'WizardStep[]', default: '-', description: '步骤定义列表。', required: true },
  { name: 'initialStep', type: 'number', default: '0', description: '初始步骤。' },
  { name: 'currentStep', type: 'number', default: '-', description: '受控当前步骤。' },
  { name: 'onStepChange', type: 'step callback', default: '-', description: '步骤变化回调。' },
  { name: 'validateStep', type: 'validate callback', default: '-', description: '全局步骤校验。' },
  { name: 'onFinish', type: 'finish callback', default: '-', description: '完成回调。' },
  { name: 'allowStepNavigation', type: 'boolean', default: 'true', description: '是否允许点击步骤导航。' },
  { name: 'direction', type: 'horizontal | vertical', default: 'horizontal', description: '步骤方向。' },
  { name: 'submitting', type: 'boolean', default: 'false', description: '外部提交中状态。' },
  { name: 'finishDisabled', type: 'boolean', default: 'false', description: '禁用完成按钮。' },
  { name: 'nextLabel', type: 'ReactNode', default: '下一步', description: '下一步文案。' },
  { name: 'previousLabel', type: 'ReactNode', default: '上一步', description: '上一步文案。' },
  { name: 'finishLabel', type: 'ReactNode', default: '完成', description: '完成文案。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'WizardStep', value: '{ id: string; title: ReactNode; content: ReactNode; description?: ReactNode; validation?: () => boolean | Promise<boolean>; status?: StepsStatus; disabled?: boolean }' },
  { name: 'WizardStepValidator', value: '() => boolean | Promise<boolean>' }
]"/>

## FAQ

### 单步校验和全局校验怎么配合？

`steps[i].validation` 先执行，再执行 `validateStep(i)`，都通过才会进入下一步。

### 如何阻止用户点击未来步骤？

组件默认仅允许点击已到达步骤，未来步骤会被拦截。
