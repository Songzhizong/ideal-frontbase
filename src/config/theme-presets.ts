/**
 * Design Token System - Theme Presets
 * Pre-configured color schemes for light and dark modes
 */

import type { ThemePreset } from "@/types/theme"

export const themePresets: ThemePreset[] = [
  {
    "key": "crimson-flame",
    "name": "炽枫红",
    "description": "热情且极具冲击力的红色主题，适用于品牌感强烈的专业界面",
    "schemes": {
      "light": {
        // 1. 品牌与破坏性操作：以 #df0428 为核心衍生
        brand: {
          primary: {
            default: "#df0428",         // 核心品牌色
            hover: "#c20323",           // 悬浮：加深
            active: "#a3031d",          // 激活
            pressed: "#8a0218",         // 点击
            fg: "#ffffff",              // 纯白文字
            subtle: "#fff1f2",          // 极淡背景：用于选中态/Badge
            onSubtle: "#df0428",        // 浅背景上的深色字
            border: "#fecdd3",          // 弱化的红色边框
            subtleBorder: "#fff1f2",
          },
          secondary: {
            default: "#18181b",         // 深色次要，参考截图中的深色文字/图标
            hover: "#27272a",
            active: "#3f3f46",
            pressed: "#09090b",
            fg: "#ffffff",
            subtle: "#f4f4f5",
            onSubtle: "#18181b",
            border: "#e4e4e7",
            subtleBorder: "#f4f4f5",
          }
        },
        destructive: {
          default: "#e11d48",           // 更加鲜明的正红色，用于区分品牌色
          hover: "#be123c",
          active: "#9f1239",
          pressed: "#881337",
          fg: "#ffffff",
          subtle: "#fff1f2",
          onSubtle: "#e11d48",
          border: "#fda4af",
          subtleBorder: "#fff1f2",
        },

        // 2. 语义状态 (遵循标准 B 端设计规范)
        status: {
          success: {
            default: "#10b981",         // 翡翠绿
            hover: "#059669",
            active: "#047857",
            pressed: "#064e3b",
            fg: "#ffffff",
            subtle: "#ecfdf5",
            onSubtle: "#065f46",
            border: "#a7f3d0",
            subtleBorder: "#d1fae5",
          },
          warning: {
            default: "#f59e0b",         // 琥珀黄
            hover: "#d97706",
            active: "#b45309",
            pressed: "#78350f",
            fg: "#ffffff",
            subtle: "#fffbeb",
            onSubtle: "#92400e",
            border: "#fde68a",
            subtleBorder: "#fef3c7",
          },
          error: {
            default: "#ef4444",
            hover: "#dc2626",
            active: "#b91c1c",
            pressed: "#7f1d1d",
            fg: "#ffffff",
            subtle: "#fef2f2",
            onSubtle: "#991b1b",
            border: "#fecaca",
            subtleBorder: "#fee2e2",
          },
          info: {
            default: "#3b82f6",         // 经典蓝
            hover: "#2563eb",
            active: "#1d4ed8",
            pressed: "#1e3a8a",
            fg: "#ffffff",
            subtle: "#eff6ff",
            onSubtle: "#1e40af",
            border: "#bfdbfe",
            subtleBorder: "#dbeafe",
          }
        },

        // 3. 增强型文字系统 (Slate/Zinc 系)
        text: {
          primary: "#09090b",           // 标题 & 正文：高对比度
          secondary: "#52525b",         // 次要：描述性文字
          tertiary: "#a1a1aa",          // 提示：页脚/禁态
          placeholder: "#d4d4d8",       // 占位符
          disabled: "#d4d4d8",
          inverse: "#ffffff",
          link: {
            default: "#df0428",         // 链接使用品牌色
            hover: "#c20323",
            active: "#a3031d",
          }
        },

        // 4. 多级容器与海拔系统 (Clean & Airy)
        background: {
          canvas: "#f8fafc",            // Level 0: 页面底色，带一点点暖调的白
          layout: "#ffffff",            // Level 1: 侧边栏/顶栏
          container: "#ffffff",         // Level 2: 卡片背景
          surface: "#f1f5f9",           // Level 3: 内部灰色区域
          elevated: "#ffffff",          // Level 4: 弹窗/下拉菜单
          muted: {
            default: "#f4f4f5",
            fg: "#71717a",
          },
          accent: {
            default: "#f4f4f5",
            fg: "#18181b",
          },
          glass: {
            bg: "rgba(255, 255, 255, 0.8)",
            border: "rgba(255, 255, 255, 0.4)",
          },
          mask: "rgba(0, 0, 0, 0.4)",
          tooltip: "#18181b",
        },

        // 5. 表单与输入系统 (Standard Shadcn Style)
        form: {
          input: "#ffffff",
          border: "#e2e8f0",
          borderHover: "#cbd5e1",
          ring: "#df0428",              // Focus Ring 使用品牌色
          label: "#0f172a",
          description: "#64748b",
          required: "#df0428",
          addon: "#f8fafc",
          readonly: "#f1f5f9",
        },

        // 6. 边框与分割线
        border: {
          base: "#e2e8f0",
          strong: "#cbd5e1",
          subtle: "#f1f5f9",
          focus: "#df0428",
        },

        // 7. 交互细节与反馈
        action: {
          selection: "#fecdd3",         // 拖选背景：淡淡的品牌红
          disabled: {
            bg: "#f4f4f5",
            text: "#a1a1aa",
            border: "#e4e4e7",
          },
          skeleton: {
            base: "#f1f5f9",
            shimmer: "#e2e8f0",
          },
          scrollbar: {
            thumb: "#d4d4d8",
            hover: "#a1a1aa",
          }
        },

        // 8. 组件特定颜色 (Sidebar v2 规范)
        component: {
          table: {
            headerBg: "#f8fafc",
            rowHover: "#f1f5f9",
            rowStriped: "#fbfcfd",
            border: "#e2e8f0",
          },
          tabs: {
            listBg: "#f1f5f9",
            triggerBg: "#ffffff",
            indicator: "#df0428",
          },
          sidebar: {
            bg: "#ffffff",              // 采用白色侧边栏，通过边框区分
            fg: "#3f3f46",
            border: "#e2e8f0",
            ring: "#df0428",
            accent: "rgba(223, 4, 40, 0.25)",
            onAccent: "#df0428",        // 侧边栏选中态使用品牌色
          }
        },

        // 9. 阴影与深度 (微小深度，符合截图中的高级感)
        effects: {
          shadow: {
            sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            md: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
            lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
          },
          glow: "0 0 15px rgba(223, 4, 40, 0.15)",
        },

        // 10. 数据可视化 (Data Viz)
        charts: {
          categorical: [
            "#df0428", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
            "#ec4899", "#06b6d4", "#f43f5e", "#14b8a6", "#f97316",
            "#6366f1", "#44403c"
          ],
          semantic: {
            positive: "#10b981",
            negative: "#df0428",
            neutral: "#64748b",
            warning: "#f59e0b",
          }
        }
      },
      "dark": {
        /* ----------------------------------
         * 1. Brand & Destructive
         * ---------------------------------- */
        brand: {
          primary: {
            default: "#df0428",
            hover: "#c70324",
            active: "#b10220",
            pressed: "#9b021c",
            fg: "#ffffff",

            subtle: "rgba(223, 4, 40, 0.14)",
            onSubtle: "#ff6b81",

            border: "rgba(223, 4, 40, 0.45)",
            subtleBorder: "rgba(223, 4, 40, 0.25)",
            contrastText: "#ffffff",
          },
          secondary: {
            default: "#3f1b22",
            hover: "#4a1f28",
            active: "#5a2530",
            pressed: "#34161c",
            fg: "#f5c6cf",

            subtle: "rgba(223, 4, 40, 0.08)",
            onSubtle: "#f0a3af",

            border: "#5a2530",
            subtleBorder: "#3a1920",
          },
        },

        destructive: {
          default: "#df0428",
          hover: "#c70324",
          active: "#b10220",
          pressed: "#9b021c",
          fg: "#ffffff",

          subtle: "rgba(223, 4, 40, 0.16)",
          onSubtle: "#ff7a8e",

          border: "rgba(223, 4, 40, 0.5)",
          subtleBorder: "rgba(223, 4, 40, 0.3)",
        },

        /* ----------------------------------
         * 2. Status
         * ---------------------------------- */
        status: {
          success: {
            default: "#22c55e",
            hover: "#16a34a",
            active: "#15803d",
            pressed: "#166534",
            fg: "#052e16",

            subtle: "rgba(34,197,94,0.14)",
            onSubtle: "#4ade80",

            border: "rgba(34,197,94,0.45)",
            subtleBorder: "rgba(34,197,94,0.25)",
          },
          warning: {
            default: "#f59e0b",
            hover: "#d97706",
            active: "#b45309",
            pressed: "#92400e",
            fg: "#451a03",

            subtle: "rgba(245,158,11,0.16)",
            onSubtle: "#fbbf24",

            border: "rgba(245,158,11,0.45)",
            subtleBorder: "rgba(245,158,11,0.25)",
          },
          error: {
            default: "#ef4444",
            hover: "#dc2626",
            active: "#b91c1c",
            pressed: "#991b1b",
            fg: "#ffffff",

            subtle: "rgba(239,68,68,0.16)",
            onSubtle: "#f87171",

            border: "rgba(239,68,68,0.45)",
            subtleBorder: "rgba(239,68,68,0.25)",
          },
          info: {
            default: "#38bdf8",
            hover: "#0ea5e9",
            active: "#0284c7",
            pressed: "#0369a1",
            fg: "#082f49",

            subtle: "rgba(56,189,248,0.16)",
            onSubtle: "#7dd3fc",

            border: "rgba(56,189,248,0.45)",
            subtleBorder: "rgba(56,189,248,0.25)",
          },
        },

        /* ----------------------------------
         * 3. Typography
         * ---------------------------------- */
        text: {
          primary: "#e5e7eb",
          secondary: "#cbd5e1",
          tertiary: "#94a3b8",
          placeholder: "#64748b",
          disabled: "#475569",
          inverse: "#ffffff",
          link: {
            default: "#ff6b81",
            hover: "#ff8fa3",
            active: "#df0428",
          },
        },

        /* ----------------------------------
         * 4. Background & Elevation
         * ---------------------------------- */
        background: {
          canvas: "#0b0d10",
          layout: "#0f1117",
          container: "#151821",
          surface: "#1b1f2b",
          elevated: "#222634",

          muted: {
            default: "#1a1e2a",
            fg: "#cbd5e1",
          },
          accent: {
            default: "rgba(223,4,40,0.18)",
            fg: "#ff9aa9",
          },

          glass: {
            bg: "rgba(21,24,33,0.6)",
            border: "rgba(255,255,255,0.08)",
          },

          mask: "rgba(0,0,0,0.6)",
          tooltip: "#2a2f40",
        },

        /* ----------------------------------
         * 5. Forms
         * ---------------------------------- */
        form: {
          input: "#151821",
          border: "#2a3042",
          borderHover: "#3a415a",
          ring: "#df0428",
          label: "#e5e7eb",
          description: "#94a3b8",
          required: "#df0428",
          addon: "#1b1f2b",
          readonly: "#11131a",
        },

        /* ----------------------------------
         * 6. Borders
         * ---------------------------------- */
        border: {
          base: "#2a3042",
          strong: "#3a415a",
          subtle: "#1e2230",
          focus: "#df0428",
        },

        /* ----------------------------------
         * 7. Actions & Feedback
         * ---------------------------------- */
        action: {
          selection: "rgba(223,4,40,0.35)",
          disabled: {
            bg: "#11131a",
            text: "#475569",
            border: "#1e2230",
          },
          skeleton: {
            base: "#1a1e2a",
            shimmer: "#2a3042",
          },
          scrollbar: {
            thumb: "#3a415a",
            hover: "#4a516d",
          },
        },

        /* ----------------------------------
         * 8. Component Overrides
         * ---------------------------------- */
        component: {
          table: {
            headerBg: "#151821",
            rowHover: "#1b1f2b",
            rowStriped: "#131722",
            border: "#2a3042",
          },
          tabs: {
            listBg: "#0f1117",
            triggerBg: "#151821",
            indicator: "#df0428",
          },
          sidebar: {
            bg: "#0f1117",
            fg: "#e5e7eb",
            border: "#1e2230",
            ring: "#df0428",
            accent: "rgba(223, 4, 40, 0.25)",
            onAccent: "#ff8fa3",
          },
        },

        /* ----------------------------------
         * 9. Effects
         * ---------------------------------- */
        effects: {
          shadow: {
            sm: "0 1px 2px rgba(0,0,0,0.4)",
            md: "0 4px 12px rgba(0,0,0,0.45)",
            lg: "0 12px 32px rgba(0,0,0,0.6)",
          },
          glow: "0 0 0 1px rgba(223,4,40,0.35), 0 0 24px rgba(223,4,40,0.25)",
        },

        /* ----------------------------------
         * 10. Charts
         * ---------------------------------- */
        charts: {
          categorical: [
            "#df0428",
            "#f97316",
            "#facc15",
            "#22c55e",
            "#38bdf8",
            "#818cf8",
            "#a855f7",
            "#ec4899",
            "#14b8a6",
            "#84cc16",
            "#eab308",
            "#fb7185",
          ],
          semantic: {
            positive: "#22c55e",
            negative: "#df0428",
            neutral: "#64748b",
            warning: "#f59e0b",
          },
        },
      }
    }
  },
]

export const defaultThemeSettings = {
  mode: "system" as const,
  activePreset: "crimson-flame",
  fontFamily: "inter",
  layout: {
    menuLayout: "single" as const,
    containerWidth: "fixed" as const,
    sidebarWidth: 240,
    sidebarCollapsedWidth: 64,
    headerHeight: 64,
  },
  ui: {
    showBreadcrumb: true,
    showBreadcrumbIcon: true,
    pageAnimation: "slide-left" as const,
    borderRadius: 12,
  },
}
