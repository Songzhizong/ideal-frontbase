import type { ThemePreset } from "@/types/theme"

export const crimsonFlame: ThemePreset = {
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
       * 1. 品牌 & 破坏性操作
       * ---------------------------------- */
      brand: {
        primary: {
          default: "#df0428",
          hover: "#f43f5e",   // 略微提亮以抵消暗背景
          active: "#be123c",
          pressed: "#9f1239",
          fg: "#fff1f2",

          subtle: "rgba(223,4,40,0.14)",
          onSubtle: "#fda4af",

          border: "rgba(244,63,94,0.35)",
          subtleBorder: "rgba(244,63,94,0.18)",
          contrastText: "#fecdd3",
        },
        secondary: {
          default: "#1f2937",
          hover: "#27303b",
          active: "#2f3945",
          pressed: "#374151",
          fg: "#e5e7eb",

          subtle: "#1b2430",
          onSubtle: "#cbd5e1",

          border: "#334155",
          subtleBorder: "#293241",
        },
      },

      /**
       * destructive：比 brand 更暗、更脏
       * 语义上明显“危险”
       */
      destructive: {
        default: "#b91c1c",
        hover: "#dc2626",
        active: "#991b1b",
        pressed: "#7f1d1d",
        fg: "#fee2e2",

        subtle: "rgba(185,28,28,0.18)",
        onSubtle: "#fecaca",

        border: "rgba(239,68,68,0.45)",
        subtleBorder: "rgba(239,68,68,0.25)",
      },

      /* ----------------------------------
       * 2. 语义状态
       * ---------------------------------- */
      status: {
        success: {
          default: "#22c55e",
          hover: "#4ade80",
          active: "#16a34a",
          pressed: "#15803d",
          fg: "#ecfdf5",

          subtle: "rgba(34,197,94,0.14)",
          onSubtle: "#86efac",

          border: "rgba(34,197,94,0.4)",
          subtleBorder: "rgba(34,197,94,0.2)",
        },
        warning: {
          default: "#fbbf24",
          hover: "#facc15",
          active: "#f59e0b",
          pressed: "#d97706",
          fg: "#fffbeb",

          subtle: "rgba(251,191,36,0.16)",
          onSubtle: "#fde68a",

          border: "rgba(251,191,36,0.45)",
          subtleBorder: "rgba(251,191,36,0.25)",
        },
        error: {
          default: "#ef4444",
          hover: "#f87171",
          active: "#dc2626",
          pressed: "#b91c1c",
          fg: "#fee2e2",

          subtle: "rgba(239,68,68,0.18)",
          onSubtle: "#fecaca",

          border: "rgba(239,68,68,0.45)",
          subtleBorder: "rgba(239,68,68,0.25)",
        },
        info: {
          default: "#60a5fa",
          hover: "#93c5fd",
          active: "#3b82f6",
          pressed: "#2563eb",
          fg: "#eff6ff",

          subtle: "rgba(96,165,250,0.16)",
          onSubtle: "#bfdbfe",

          border: "rgba(96,165,250,0.45)",
          subtleBorder: "rgba(96,165,250,0.25)",
        },
      },

      /* ----------------------------------
       * 3. 文字系统
       * ---------------------------------- */
      text: {
        primary: "#e5e7eb",
        secondary: "#9ca3af",
        tertiary: "#6b7280",
        placeholder: "#4b5563",
        disabled: "#374151",
        inverse: "#020617",
        link: {
          default: "#f43f5e",
          hover: "#fb7185",
          active: "#e11d48",
        },
      },

      /* ----------------------------------
       * 4. 背景 / 海拔
       * ---------------------------------- */
      background: {
        canvas: "#0b1220",
        layout: "#0f172a",
        container: "#111827",
        surface: "#162032",
        elevated: "#1b263b",

        muted: {
          default: "#1f2937",
          fg: "#9ca3af",
        },
        accent: {
          default: "rgba(223,4,40,0.18)",
          fg: "#fda4af",
        },

        glass: {
          bg: "rgba(15,23,42,0.6)",
          border: "rgba(255,255,255,0.06)",
        },

        mask: "rgba(2,6,23,0.72)",
        tooltip: "#020617",
      },

      /* ----------------------------------
       * 5. 表单
       * ---------------------------------- */
      form: {
        input: "#0f172a",
        border: "#243041",
        borderHover: "#334155",
        ring: "#df0428",
        label: "#d1d5db",
        description: "#9ca3af",
        required: "#ef4444",
        addon: "#1f2937",
        readonly: "#020617",
      },

      /* ----------------------------------
       * 6. 边框
       * ---------------------------------- */
      border: {
        base: "#1f2937",
        strong: "#334155",
        subtle: "#162032",
        focus: "#df0428",
      },

      /* ----------------------------------
       * 7. 交互与反馈
       * ---------------------------------- */
      action: {
        selection: "rgba(223,4,40,0.35)",
        disabled: {
          bg: "#020617",
          text: "#475569",
          border: "#1e293b",
        },
        skeleton: {
          base: "#111827",
          shimmer: "#1f2937",
        },
        scrollbar: {
          thumb: "#334155",
          hover: "#475569",
        },
      },

      /* ----------------------------------
       * 8. 组件级
       * ---------------------------------- */
      component: {
        table: {
          headerBg: "#0f172a",
          rowHover: "rgba(223,4,40,0.08)",
          rowStriped: "#0b1220",
          border: "#1f2937",
        },
        tabs: {
          listBg: "#0f172a",
          triggerBg: "#020617",
          indicator: "#df0428",
        },
        sidebar: {
          bg: "#020617",
          fg: "#e5e7eb",
          border: "#1f2937",
          ring: "#df0428",
          accent: "rgba(223,4,40,0.2)",
          onAccent: "#fda4af",
        },
      },

      /* ----------------------------------
       * 9. 阴影 & 光效
       * ---------------------------------- */
      effects: {
        shadow: {
          sm: "0 1px 2px rgba(0,0,0,0.45)",
          md: "0 8px 24px rgba(0,0,0,0.55)",
          lg: "0 16px 48px rgba(0,0,0,0.65)",
        },
        glow:
          "0 0 0 1px rgba(223,4,40,0.28), 0 0 28px rgba(223,4,40,0.35)",
      },

      /* ----------------------------------
       * 10. 数据可视化
       * ---------------------------------- */
      charts: {
        categorical: [
          "#f43f5e",
          "#60a5fa",
          "#22c55e",
          "#fbbf24",
          "#a78bfa",
          "#22d3ee",
          "#ef4444",
          "#4ade80",
          "#fb7185",
          "#38bdf8",
          "#eab308",
          "#c084fc",
        ],
        semantic: {
          positive: "#22c55e",
          negative: "#ef4444",
          neutral: "#9ca3af",
          warning: "#fbbf24",
        },
      },
    }
  }
}
