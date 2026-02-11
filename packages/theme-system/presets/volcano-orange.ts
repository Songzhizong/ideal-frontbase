import type { ThemePreset } from "../types/theme"

export const volcanoOrange: ThemePreset = {
  key: "volcano-orange",
  name: "火山橙",
  description:
    "一种充满活力与热情的橙红色调，用于强调创造力与行动力，高对比度设计使其在数据密集型或营销导向的界面中极具视觉冲击力。",
  schemes: {
    light: {
      /* ----------------------------------
       * 1. 品牌 & 破坏性操作
       * ---------------------------------- */
      brand: {
        primary: {
          default: "#fa541c",
          hover: "#d4380d",
          active: "#ad2102",
          pressed: "#871400",
          fg: "#ffffff",

          subtle: "rgba(250,84,28,0.1)",
          onSubtle: "#ad2102",

          border: "rgba(250,84,28,0.35)",
          subtleBorder: "rgba(250,84,28,0.2)",
          contrastText: "#871400",
        },
        secondary: {
          default: "#f1f5f9",
          hover: "#e2e8f0",
          active: "#cbd5e1",
          pressed: "#94a3b8",
          fg: "#0f172a",

          subtle: "#f8fafc",
          onSubtle: "#334155",

          border: "#e2e8f0",
          subtleBorder: "#f1f5f9",
        },
      },

      destructive: {
        default: "#dc2626",
        hover: "#b91c1c",
        active: "#991b1b",
        pressed: "#7f1d1d",
        fg: "#ffffff",

        subtle: "rgba(220,38,38,0.1)",
        onSubtle: "#991b1b",

        border: "rgba(220,38,38,0.35)",
        subtleBorder: "rgba(220,38,38,0.2)",
      },

      /* ----------------------------------
       * 2. 语义状态
       * ---------------------------------- */
      status: {
        success: {
          default: "#16a34a",
          hover: "#15803d",
          active: "#166534",
          pressed: "#14532d",
          fg: "#ffffff",

          subtle: "rgba(34,197,94,0.12)",
          onSubtle: "#166534",

          border: "rgba(22,163,74,0.4)",
          subtleBorder: "rgba(22,163,74,0.25)",
        },
        warning: {
          default: "#f59e0b",
          hover: "#d97706",
          active: "#b45309",
          pressed: "#92400e",
          fg: "#ffffff",

          subtle: "rgba(245,158,11,0.15)",
          onSubtle: "#92400e",

          border: "rgba(245,158,11,0.4)",
          subtleBorder: "rgba(245,158,11,0.25)",
        },
        error: {
          default: "#dc2626",
          hover: "#b91c1c",
          active: "#991b1b",
          pressed: "#7f1d1d",
          fg: "#ffffff",

          subtle: "rgba(220,38,38,0.12)",
          onSubtle: "#991b1b",

          border: "rgba(220,38,38,0.4)",
          subtleBorder: "rgba(220,38,38,0.25)",
        },
        info: {
          default: "#1677ff",
          hover: "#4096ff",
          active: "#0958d9",
          pressed: "#003eb3",
          fg: "#ffffff",

          subtle: "rgba(22,119,255,0.12)",
          onSubtle: "#0958d9",

          border: "rgba(22,119,255,0.4)",
          subtleBorder: "rgba(22,119,255,0.25)",
        },
      },

      /* ----------------------------------
       * 3. 文字系统
       * ---------------------------------- */
      text: {
        primary: "#020617",
        secondary: "#334155",
        tertiary: "#64748b",
        placeholder: "#94a3b8",
        disabled: "#cbd5e1",
        inverse: "#ffffff",
        link: {
          default: "#fa541c",
          hover: "#d4380d",
          active: "#ad2102",
        },
      },

      /* ----------------------------------
       * 4. 背景 / 海拔
       * ---------------------------------- */
      background: {
        canvas: "#f8fafc",
        layout: "#f1f5f9",
        container: "#ffffff",
        surface: "#f8fafc",
        elevated: "#ffffff",

        muted: {
          default: "#f1f5f9",
          fg: "#475569",
        },
        accent: {
          default: "rgba(250,84,28,0.1)",
          fg: "#ad2102",
        },

        glass: {
          bg: "rgba(255,255,255,0.75)",
          border: "rgba(15,23,42,0.08)",
        },

        mask: "rgba(15,23,42,0.45)",
        tooltip: "#020617",
      },

      /* ----------------------------------
       * 5. 表单
       * ---------------------------------- */
      form: {
        input: "#ffffff",
        border: "#e2e8f0",
        borderHover: "#cbd5e1",
        ring: "#fa541c",
        label: "#020617",
        description: "#64748b",
        required: "#dc2626",
        addon: "#f1f5f9",
        readonly: "#f8fafc",
      },

      /* ----------------------------------
       * 6. 边框
       * ---------------------------------- */
      border: {
        base: "#e2e8f0",
        strong: "#cbd5e1",
        subtle: "#f1f5f9",
        focus: "#fa541c",
      },

      /* ----------------------------------
       * 7. 交互与反馈
       * ---------------------------------- */
      action: {
        selection: "rgba(250,84,28,0.25)",
        disabled: {
          bg: "#f1f5f9",
          text: "#94a3b8",
          border: "#e2e8f0",
        },
        skeleton: {
          base: "#e5e7eb",
          shimmer: "#f1f5f9",
        },
        scrollbar: {
          thumb: "#cbd5e1",
          hover: "#94a3b8",
        },
      },

      /* ----------------------------------
       * 8. 组件级
       * ---------------------------------- */
      component: {
        table: {
          headerBg: "#f8fafc",
          rowHover: "rgba(250,84,28,0.05)",
          rowStriped: "#ffffff",
          border: "#e2e8f0",
        },
        tabs: {
          listBg: "#f1f5f9",
          triggerBg: "#ffffff",
          indicator: "#fa541c",
        },
        sidebar: {
          bg: "#ffffff",
          fg: "#020617",
          border: "#e2e8f0",
          ring: "#fa541c",
          accent: "#fff2e8",
          onAccent: "#d4380d",
        },
      },

      /* ----------------------------------
       * 9. 阴影 & 光效
       * ---------------------------------- */
      effects: {
        shadow: {
          sm: "0 1px 2px rgba(2,6,23,0.06)",
          md: "0 4px 12px rgba(2,6,23,0.08)",
          lg: "0 12px 32px rgba(2,6,23,0.12)",
        },
        glow: "0 0 0 1px rgba(250,84,28,0.25)",
      },

      /* ----------------------------------
       * 10. 数据可视化
       * ---------------------------------- */
      charts: {
        categorical: [
          "#fa541c", // Volcano
          "#fa8c16", // Sunset
          "#13c2c2", // Cyan
          "#52c41a", // Green
          "#2f54eb", // Geekblue
          "#722ed1", // Purple
          "#eb2f96", // Magenta
          "#faad14", // Gold
        ],
        semantic: {
          positive: "#52c41a",
          negative: "#f5222d",
          neutral: "#8c8c8c",
          warning: "#faad14",
        },
      },
    },
    dark: {
      brand: {
        primary: {
          default: "#fa541c",
          hover: "#ff7a45",
          active: "#d4380d",
          pressed: "#ad2102",
          fg: "#ffffff",

          subtle: "rgba(250,84,28,0.2)",
          onSubtle: "#ffbb96",

          border: "rgba(250,84,28,0.4)",
          subtleBorder: "rgba(250,84,28,0.25)",
          contrastText: "#ffd8bf",
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

      destructive: {
        default: "#dc2626",
        hover: "#ef4444",
        active: "#b91c1c",
        pressed: "#991b1b",
        fg: "#fee2e2",

        subtle: "rgba(220,38,38,0.2)",
        onSubtle: "#fecaca",

        border: "rgba(239,68,68,0.45)",
        subtleBorder: "rgba(239,68,68,0.25)",
      },

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
          default: "#1677ff",
          hover: "#4096ff",
          active: "#0958d9",
          pressed: "#003eb3",
          fg: "#ffffff",

          subtle: "rgba(22,119,255,0.18)",
          onSubtle: "#69b1ff",

          border: "rgba(22,119,255,0.45)",
          subtleBorder: "rgba(22,119,255,0.25)",
        },
      },

      text: {
        primary: "#e5e7eb",
        secondary: "#9ca3af",
        tertiary: "#6b7280",
        placeholder: "#4b5563",
        disabled: "#374151",
        inverse: "#020617",
        link: {
          default: "#fa541c",
          hover: "#ff7a45",
          active: "#d4380d",
        },
      },

      background: {
        canvas: "#0b1220",
        layout: "#0f172a",
        container: "#111827",
        surface: "#1e293b",
        elevated: "#2d3748",

        muted: {
          default: "#1f2937",
          fg: "#9ca3af",
        },
        accent: {
          default: "rgba(250,84,28,0.15)",
          fg: "#ffbb96",
        },

        glass: {
          bg: "rgba(15,23,42,0.6)",
          border: "rgba(255,255,255,0.06)",
        },

        mask: "rgba(2,6,23,0.72)",
        tooltip: "#020617",
      },

      form: {
        input: "#0f172a",
        border: "#243041",
        borderHover: "#334155",
        ring: "#fa541c",
        label: "#d1d5db",
        description: "#9ca3af",
        required: "#ef4444",
        addon: "#1f2937",
        readonly: "#020617",
      },

      border: {
        base: "#1f2937",
        strong: "#334155",
        subtle: "#162032",
        focus: "#fa541c",
      },

      action: {
        selection: "rgba(250,84,28,0.35)",
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

      component: {
        table: {
          headerBg: "#0f172a",
          rowHover: "rgba(250,84,28,0.08)",
          rowStriped: "#0b1220",
          border: "#1f2937",
        },
        tabs: {
          listBg: "#0f172a",
          triggerBg: "#020617",
          indicator: "#fa541c",
        },
        sidebar: {
          bg: "#020617",
          fg: "#e5e7eb",
          border: "#1f2937",
          ring: "#fa541c",
          accent: "rgba(250,84,28,0.15)",
          onAccent: "#ffbb96",
        },
      },

      effects: {
        shadow: {
          sm: "0 1px 2px rgba(0,0,0,0.45)",
          md: "0 8px 24px rgba(0,0,0,0.55)",
          lg: "0 16px 48px rgba(0,0,0,0.65)",
        },
        glow: "0 0 0 1px rgba(250,84,28,0.28), 0 0 28px rgba(250,84,28,0.35)",
      },

      /* ----------------------------------
       * 10. 数据可视化
       * ---------------------------------- */
      charts: {
        categorical: [
          "#fa541c",
          "#fa8c16",
          "#13c2c2",
          "#52c41a",
          "#2f54eb",
          "#722ed1",
          "#eb2f96",
          "#fadb14",
        ],
        semantic: {
          positive: "#49aa19",
          negative: "#d9363e",
          neutral: "#8c8c8c",
          warning: "#fffb8f",
        },
      },
    },
  },
}
