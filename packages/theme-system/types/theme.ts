/**
 * 核心状态定义：用于 Primary, Success, Error 等功能色
 * 遵循 shadcn/ui 的背景/前景 (Background/Foreground) 逻辑
 */
export interface ColorState {
  /** 基础色：用于主要背景、实底按钮 (e.g., .bg-primary, .bg-destructive) */
  default: string
  /** 悬浮态：用户指针移入时的交互颜色 (e.g., .hover:bg-primary/90) */
  hover?: string
  /** 前景文字色：确保在 default 背景上拥有高对比度的读写性 (e.g., .text-primary-foreground) */
  fg: string

  // 弱强调模式 (用于 Tag, Alert, Tab 激活背景)
  /** 极淡的背景色：用于 Alert、Tag 或选中的行背景 (e.g., .bg-primary/10) */
  subtle?: string
  /** 在 subtle 背景上的文字色：通常比 default 色深，用于增强可读性 */
  onSubtle?: string

  // 边框
  /** 标准状态边框色：用于功能性组件的外轮廓 */
  border?: string
}

export interface ThemeGradientTokens {
  /** 主品牌渐变：用于重点卡片、品牌按钮、视觉强调区域 */
  brand: string
  /** 弱化品牌渐变：用于大面积背景或低对比度装饰区域 */
  brandSoft: string
}

export interface ThemeMaterialTokens {
  /** 玻璃层：背景、边框和模糊半径 */
  glass: {
    bg: string
    border: string
    blur: string
  }
  /** 海拔层：用于弹层/卡片等需要更强层级感的容器 */
  elevated: {
    bg: string
    border: string
    shadow: string
  }
}

/**
 * 完整调色板定义
 * 旨在为开发人员提供直观的语义引用，并为 AI 工具提供上下文决策依据
 */
export interface ColorPalette {
  // 1. 品牌与破坏性操作 (Brand & Destructive)
  brand: {
    /** 主品牌色：应用范围最广，如主要按钮、进度条、开关开启状态 */
    primary: ColorState
    /** 次要品牌色：用于辅助操作、非核心行动点 */
    secondary: ColorState
  }
  /** 破坏性操作：专门用于删除、离职、停止等危险动作 (shadcn 一等公民) */
  destructive: ColorState

  // 2. 语义状态 (Status)
  status: {
    /** 成功状态：用于表单校验通过、操作完成提示、金额上涨 */
    success: ColorState
    /** 警告状态：用于风险提示、待办事项、余额不足 */
    warning: ColorState
    /** 错误状态：用于表单报错、系统异常、金额下跌 */
    error: ColorState
    /** 信息状态：用于系统通知、中性的指引说明 */
    info: ColorState
  }

  // 3. 增强型文字系统 (Typography)
  text: {
    /** 标题与正文：最高优先级文字 (对应 shadcn 的 .text-foreground) */
    primary: string
    /** 次要描述：用于副标题、列表摘要、元数据 */
    secondary: string
    /** 提示性文字：用于时间戳、页脚声明 (对应 shadcn 的 .text-muted-foreground) */
    tertiary: string
    /** 占位符：Input/Textarea 的 placeholder 专用 */
    placeholder: string
    /** 禁用文字：全局禁用文字 fallback（组件若定义 action.disabled.text 则优先） */
    disabled: string
    /** 反色文字：在深色/主色背景上显示的亮色文字 */
    inverse: string
    link: {
      /** 链接默认颜色 */
      default: string
      /** 链接悬浮反馈 */
      hover: string
    }
  }

  // 4. 背景与容器系统 (Background & Surface)
  background: {
    /** 页面最底层背景 (对应 .bg-background) */
    app: string
    /** 主要容器背景 (对应 .bg-card) */
    surface: string
    /** 浮层背景 (对应 .bg-popover) */
    overlay: string
    /** 输入框背景：用于 Input / Textarea / Select 等表单控件 */
    input: string

    // 特殊交互背景
    /** 弱化区域：用于灰色按钮背景、搜索框背景 (对应 .bg-muted) */
    muted: {
      default: string
      fg: string
    }
    /** 选中项：用于 Command 列表或 Select 下拉的当前项 (对应 .bg-accent) */
    accent: {
      default: string
      fg: string
    }

    /** 模态框遮罩层：通常为带透明度的黑色 (Overlay) */
    mask: string
  }

  // 5. 边框与分割线 (Borders)
  border: {
    /** 默认分割线颜色：用于 Separator 组件 (对应 .border-border) */
    base: string
    /** 强分割线：用于区分大块区域或表头底部 */
    strong: string
    /** 极淡分割线：用于密集列表项之间的细线 */
    subtle: string
    /** 全局聚焦状态的边框色 */
    focus: string
  }

  // 6. 交互细节与反馈 (Actions & Feedback)
  action?: {
    /** 鼠标拖选文字的背景色 (::selection) */
    selection: string
    /** 组件禁用态：背景、文字、边框的一致性定义（优先级高于 text.disabled） */
    disabled: {
      bg: string
      text: string
      border: string
    }
    /** 骨架屏：基础背景色与扫过时的闪烁色 (Shimmer) */
    skeleton: {
      base: string
      shimmer: string
    }
    /** 滚动条：针对 Webkit 浏览器的滑块颜色定义 */
    scrollbar: {
      thumb: string
      hover: string
    }
  }

  // 7. 组件特定颜色 (Component Specific Overrides)
  component: {
    /** 侧边栏专属颜色组：由于侧边栏通常有独立的色彩体系 (shadcn sidebar v2 规范) */
    sidebar: {
      bg: string
      fg: string
      border: string
      ring: string
      accent: string
      onAccent: string
    }
  }

  // 8. 阴影与深度 (Effects)
  effects?: {
    /** 投影系统：分层级定义，对应 Tailwinds shadow-sm/md/lg */
    shadow: {
      sm: string
      md: string
      lg: string
    }
    /** 品牌光晕：用于暗黑模式下按钮或容器周围的微弱发光效果 */
    glow: string
    /** 语义渐变：用于营销区、强调区、仪表盘 Hero 区块 */
    gradient?: ThemeGradientTokens
    /** 语义材质：用于玻璃拟态与海拔层级表达 */
    material?: ThemeMaterialTokens
  }

  // 9. 数据可视化 (Data Viz)
  charts?: {
    /** 离散分类色谱：用于饼图、多线图，建议提供 12 组对比明显的颜色 */
    categorical?: string[]
    /** 语义化图表色：如趋势图的正负向颜色 */
    semantic?: {
      positive: string
      negative: string
      neutral: string
      warning: string
    }
  }
}

export interface ThemeSchemes {
  light: ColorPalette
  dark: ColorPalette
}

export interface ThemePreset {
  key: string
  name: string
  description?: string
  schemes: ThemeSchemes
}

export interface ThemeConfig {
  // Active theme mode
  mode: "light" | "dark" | "system"

  // Active preset key
  activePreset: string

  // Typography
  fontFamily: string

  // Layout
  layout: {
    menuLayout: "single" | "dual"
    containerWidth: "full" | "fixed"
    sidebarWidth: number
    sidebarCollapsedWidth: number
    headerHeight: number
  }

  // UI Preferences
  ui: {
    showBreadcrumb: boolean
    showBreadcrumbIcon: boolean
    sidebarAccordion: boolean
    pageAnimation: "none" | "fade" | "slide-left" | "slide-bottom" | "slide-top"
    borderRadius: number
  }
}

export type ThemeMode = "light" | "dark"
