/**
 * 核心状态定义：用于 Primary, Success, Error 等功能色
 * 遵循 shadcn/ui 的背景/前景 (Background/Foreground) 逻辑
 */
export interface ColorState {
  /** 基础色：用于主要背景、实底按钮 (e.g., .bg-primary, .bg-destructive) */
  default: string
  /** 悬浮态：用户指针移入时的交互颜色 (e.g., .hover:bg-primary/90) */
  hover: string
  /** 激活态：组件被选中或处于 Toggle 开启状态 (e.g., .data-[state=active]:bg-...) */
  active: string
  /** 点击态：用户按下瞬间的深色反馈 */
  pressed: string
  /** 前景文字色：确保在 default 背景上拥有高对比度的读写性 (e.g., .text-primary-foreground) */
  fg: string

  // 弱强调模式 (用于 Badge, Alert, Tab 激活背景)
  /** 极淡的背景色：用于 Alert、Badge 或选中的行背景 (e.g., .bg-primary/10) */
  subtle: string
  /** 在 subtle 背景上的文字色：通常比 default 色深，用于增强可读性 */
  onSubtle: string

  // 边框
  /** 标准状态边框色：用于功能性组件的外轮廓 */
  border: string
  /** 极淡的边框色：用于内部装饰性分割或弱化边界 */
  subtleBorder: string

  // 辅助
  /** 增强对比色：专门用于深色模式或高对比度模式下的文字修正 */
  contrastText?: string
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
    /** 禁用文字：Disabled 状态下的文字颜色 */
    disabled: string
    /** 反色文字：在深色/主色背景上显示的亮色文字 */
    inverse: string
    link: {
      /** 链接默认颜色 */
      default: string
      /** 链接悬浮反馈 */
      hover: string
      /** 链接点击效果 */
      active: string
    }
  }

  // 4. 多级容器与海拔系统 (Surfaces & Elevation)
  // 核心逻辑：层级越高 (Z-index 越大)，在深色模式下颜色应越浅以体现物理深度
  background: {
    /** Level 0: 页面最底层背景 (对应 .bg-background) */
    canvas: string
    /** Level 1: 侧边栏、工具栏等全局框架的底部背景 */
    layout: string
    /** Level 2: 卡片背景、列表容器 (对应 .bg-card) */
    container: string
    /** Level 3: 卡片内部嵌套的区域、代码块、引用块背景 */
    surface: string
    /** Level 4: 悬浮层、对话框、下拉菜单 (对应 .bg-popover) */
    elevated: string

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

    // 玻璃拟态 (Glassmorphism)
    glass: {
      /** 带有 Backdrop-blur 的半透明背景 */
      bg: string
      /** 玻璃边缘的高光边框，模拟物理折射 */
      border: string
    }

    /** 模态框遮罩层：通常为带透明度的黑色 (Overlay) */
    mask: string
    /** 文字提示背景：独立于 Elevation 系统的 Tooltip 背景色 */
    tooltip: string
  }

  // 5. 表单与输入系统 (Forms)
  form: {
    /** 输入框/文本域的填充底色 */
    input: string
    /** 默认边框色 (对应 .border-input) */
    border: string
    /** 悬浮时的边框强调 */
    borderHover: string
    /** 聚焦时的外环 (对应 .ring-ring) */
    ring: string
    /** 表单标签文字 (Label) */
    label: string
    /** 字段下方的辅助说明文字 */
    description: string
    /** 必填项的红星 (*) 颜色 */
    required: string
    /** 输入框前缀/后缀的灰色背景块 */
    addon: string
    /** 只读或禁用状态下的填充色 */
    readonly: string
  }

  // 6. 边框与分割线 (Borders)
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

  // 7. 交互细节与反馈 (Actions & Feedback)
  action: {
    /** 鼠标拖选文字的背景色 (::selection) */
    selection: string
    /** 全局禁用态：背景、文字、边框的一致性定义 */
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

  // 8. 组件特定颜色 (Component Specific Overrides)
  component: {
    table: {
      /** 表头背景色 */
      headerBg: string
      /** 表格行悬浮色 */
      rowHover: string
      /** 奇偶行斑马纹背景 */
      rowStriped: string
      /** 单元格边框线 */
      border: string
    }
    tabs: {
      /** Tab 整体容器的底色 */
      listBg: string
      /** 单个 Tab 触发器的背景 */
      triggerBg: string
      /** 选中态的下划线或滑块颜色 */
      indicator: string
    }
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

  // 9. 阴影与深度 (Effects)
  effects: {
    /** 投影系统：分层级定义，对应 Tailwinds shadow-sm/md/lg */
    shadow: {
      sm: string
      md: string
      lg: string
    }
    /** 品牌光晕：用于暗黑模式下按钮或容器周围的微弱发光效果 */
    glow: string
  }

  // 10. 数据可视化 (Data Viz)
  charts: {
    /** 离散分类色谱：用于饼图、多线图，建议提供 12 组对比明显的颜色 */
    categorical: string[]
    /** 语义化图表色：如趋势图的正负向颜色 */
    semantic: {
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
