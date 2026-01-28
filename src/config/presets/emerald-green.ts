import type { ThemePreset } from "@/types/theme"

export const emeraldGreen: ThemePreset = {
  "key": "emerald-green",
  "name": "翡翠绿",
  "description": "沉稳自然的绿色主题，专业且护眼",
  "schemes": {
    "light": {
      /* ----------------------------------
       * 1. 品牌 & 破坏性操作
       * ---------------------------------- */
      brand: {
        primary: {
          default: "#059669",
          hover: "#047857",
          active: "#065f46",
          pressed: "#064e3b",
          fg: "#ffffff",

          subtle: "rgba(5,150,105,0.1)",
          onSubtle: "#047857",

          border: "rgba(5,150,105,0.35)",
          subtleBorder: "rgba(5,150,105,0.2)",
          contrastText: "#064e3b",
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
          default: "#2563eb",
          hover: "#1d4ed8",
          active: "#1e40af",
          pressed: "#1e3a8a",
          fg: "#ffffff",

          subtle: "rgba(59,130,246,0.12)",
          onSubtle: "#1e40af",

          border: "rgba(59,130,246,0.4)",
          subtleBorder: "rgba(59,130,246,0.25)",
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
        disabled: "#cbd5f5",
        inverse: "#ffffff",
        link: {
          default: "#059669",
          hover: "#047857",
          active: "#065f46",
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
          default: "rgba(5,150,105,0.12)",
          fg: "#047857",
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
        ring: "#059669",
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
        focus: "#059669",
      },

      /* ----------------------------------
       * 7. 交互与反馈
       * ---------------------------------- */
      action: {
        selection: "rgba(5,150,105,0.25)",
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
          rowHover: "rgba(5,150,105,0.06)",
          rowStriped: "#ffffff",
          border: "#e2e8f0",
        },
        tabs: {
          listBg: "#f1f5f9",
          triggerBg: "#ffffff",
          indicator: "#059669",
        },
        sidebar: {
          bg: "#ffffff",
          fg: "#020617",
          border: "#e2e8f0",
          ring: "#059669",
          accent: "rgba(5,150,105,0.12)",
          onAccent: "#047857",
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
        glow: "0 0 0 1px rgba(5,150,105,0.25)",
      },

      /* ----------------------------------
       * 10. 数据可视化
       * ---------------------------------- */
      charts: {
        categorical: [
          "#059669",
          "#2563eb",
          "#f59e0b",
          "#db2777",
          "#7c3aed",
          "#0891b2",
          "#dc2626",
          "#16a34a",
          "#e11d48",
          "#0284c7",
          "#ca8a04",
          "#9333ea",
        ],
        semantic: {
          positive: "#16a34a",
          negative: "#dc2626",
          neutral: "#64748b",
          warning: "#f59e0b",
        },
      },
    },
    "dark": {
      /* ----------------------------------
       * 1. 品牌 & 破坏性操作
       * ---------------------------------- */
      brand: {
        primary: {
          default: "#059669", // emerald-600
          hover: "#10b981",   // emerald-500
          active: "#047857",  // emerald-700
          pressed: "#065f46", // emerald-800
          fg: "#ecfdf5",

          subtle: "rgba(5,150,105,0.12)",
          onSubtle: "#6ee7b7",

          border: "rgba(16,185,129,0.35)",
          subtleBorder: "rgba(16,185,129,0.18)",
          contrastText: "#d1fae5",
        },
        secondary: {
          default: "#1f2933",
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
        fg: "#fef2f2",

        subtle: "rgba(220,38,38,0.12)",
        onSubtle: "#fecaca",

        border: "rgba(239,68,68,0.4)",
        subtleBorder: "rgba(239,68,68,0.2)",
      },

      /* ----------------------------------
       * 2. 语义状态
       * ---------------------------------- */
      status: {
        success: {
          default: "#16a34a",
          hover: "#22c55e",
          active: "#15803d",
          pressed: "#166534",
          fg: "#ecfdf5",

          subtle: "rgba(34,197,94,0.12)",
          onSubtle: "#86efac",

          border: "rgba(34,197,94,0.4)",
          subtleBorder: "rgba(34,197,94,0.2)",
        },
        warning: {
          default: "#f59e0b",
          hover: "#fbbf24",
          active: "#d97706",
          pressed: "#b45309",
          fg: "#fffbeb",

          subtle: "rgba(245,158,11,0.14)",
          onSubtle: "#fde68a",

          border: "rgba(251,191,36,0.45)",
          subtleBorder: "rgba(251,191,36,0.25)",
        },
        error: {
          default: "#dc2626",
          hover: "#ef4444",
          active: "#b91c1c",
          pressed: "#991b1b",
          fg: "#fef2f2",

          subtle: "rgba(220,38,38,0.14)",
          onSubtle: "#fecaca",

          border: "rgba(239,68,68,0.45)",
          subtleBorder: "rgba(239,68,68,0.25)",
        },
        info: {
          default: "#2563eb",
          hover: "#3b82f6",
          active: "#1d4ed8",
          pressed: "#1e40af",
          fg: "#eff6ff",

          subtle: "rgba(59,130,246,0.14)",
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
          default: "#34d399",
          hover: "#6ee7b7",
          active: "#10b981",
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
          default: "rgba(5,150,105,0.16)",
          fg: "#6ee7b7",
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
        ring: "#059669",
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
        focus: "#059669",
      },

      /* ----------------------------------
       * 7. 交互与反馈
       * ---------------------------------- */
      action: {
        selection: "rgba(5,150,105,0.35)",
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
          rowHover: "rgba(5,150,105,0.08)",
          rowStriped: "#0b1220",
          border: "#1f2937",
        },
        tabs: {
          listBg: "#0f172a",
          triggerBg: "#020617",
          indicator: "#059669",
        },
        sidebar: {
          bg: "#020617",
          fg: "#e5e7eb",
          border: "#1f2937",
          ring: "#059669",
          accent: "rgba(5,150,105,0.18)",
          onAccent: "#6ee7b7",
        },
      },

      /* ----------------------------------
       * 9. 阴影 & 光效
       * ---------------------------------- */
      effects: {
        shadow: {
          sm: "0 1px 2px rgba(0,0,0,0.4)",
          md: "0 8px 24px rgba(0,0,0,0.5)",
          lg: "0 16px 48px rgba(0,0,0,0.6)",
        },
        glow: "0 0 0 1px rgba(5,150,105,0.25), 0 0 24px rgba(5,150,105,0.35)",
      },

      /* ----------------------------------
       * 10. 数据可视化
       * ---------------------------------- */
      charts: {
        categorical: [
          "#34d399",
          "#60a5fa",
          "#fbbf24",
          "#f472b6",
          "#a78bfa",
          "#22d3ee",
          "#f87171",
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
          warning: "#f59e0b",
        },
      },
    }
  }
}
