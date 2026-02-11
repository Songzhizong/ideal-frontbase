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
          default: "#fff7e6",
          hover: "#ffe7ba",
          active: "#ffd591",
          pressed: "#ffc069",
          fg: "#431418",

          subtle: "#fff1b8",
          onSubtle: "#612500",

          border: "#ffe7ba",
          subtleBorder: "#fff7e6",
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
          default: "#389e0d",
          hover: "#237804",
          active: "#135200",
          pressed: "#092b00",
          fg: "#ffffff",

          subtle: "rgba(56,158,13,0.12)",
          onSubtle: "#135200",

          border: "rgba(56,158,13,0.4)",
          subtleBorder: "rgba(56,158,13,0.25)",
        },
        warning: {
          default: "#faad14",
          hover: "#d48806",
          active: "#ad6800",
          pressed: "#874d00",
          fg: "#ffffff",

          subtle: "rgba(250,173,20,0.15)",
          onSubtle: "#874d00",

          border: "rgba(250,173,20,0.4)",
          subtleBorder: "rgba(250,173,20,0.25)",
        },
        error: {
          default: "#f5222d",
          hover: "#cf1322",
          active: "#a8071a",
          pressed: "#820014",
          fg: "#ffffff",

          subtle: "rgba(245,34,45,0.12)",
          onSubtle: "#a8071a",

          border: "rgba(245,34,45,0.4)",
          subtleBorder: "rgba(245,34,45,0.25)",
        },
        info: {
          default: "#fa541c",
          hover: "#d4380d",
          active: "#ad2102",
          pressed: "#871400",
          fg: "#ffffff",

          subtle: "rgba(250,84,28,0.12)",
          onSubtle: "#ad2102",

          border: "rgba(250,84,28,0.4)",
          subtleBorder: "rgba(250,84,28,0.25)",
        },
      },

      /* ----------------------------------
       * 3. 文字系统
       * ---------------------------------- */
      text: {
        primary: "#262626",
        secondary: "#595959",
        tertiary: "#8c8c8c",
        placeholder: "#bfbfbf",
        disabled: "#d9d9d9",
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
        canvas: "#fefefe",
        layout: "#f5f5f5",
        container: "#ffffff",
        surface: "#fafafa",
        elevated: "#ffffff",

        muted: {
          default: "#f5f5f5",
          fg: "#595959",
        },
        accent: {
          default: "rgba(250,84,28,0.1)",
          fg: "#ad2102",
        },

        glass: {
          bg: "rgba(255,255,255,0.8)",
          border: "rgba(0,0,0,0.06)",
        },

        mask: "rgba(0,0,0,0.45)",
        tooltip: "#262626",
      },

      /* ----------------------------------
       * 5. 表单
       * ---------------------------------- */
      form: {
        input: "#ffffff",
        border: "#d9d9d9",
        borderHover: "#fa541c",
        ring: "#fa541c",
        label: "#262626",
        description: "#8c8c8c",
        required: "#f5222d",
        addon: "#fafafa",
        readonly: "#f5f5f5",
      },

      /* ----------------------------------
       * 6. 边框
       * ---------------------------------- */
      border: {
        base: "#d9d9d9",
        strong: "#bfbfbf",
        subtle: "#f0f0f0",
        focus: "#fa541c",
      },

      /* ----------------------------------
       * 7. 交互与反馈
       * ---------------------------------- */
      action: {
        selection: "rgba(250,84,28,0.2)",
        disabled: {
          bg: "#f5f5f5",
          text: "#bfbfbf",
          border: "#d9d9d9",
        },
        skeleton: {
          base: "#f0f0f0",
          shimmer: "#ffffff",
        },
        scrollbar: {
          thumb: "#bfbfbf",
          hover: "#8c8c8c",
        },
      },

      /* ----------------------------------
       * 8. 组件级
       * ---------------------------------- */
      component: {
        table: {
          headerBg: "#fafafa",
          rowHover: "rgba(250,84,28,0.04)",
          rowStriped: "#ffffff",
          border: "#f0f0f0",
        },
        tabs: {
          listBg: "#f5f5f5",
          triggerBg: "#ffffff",
          indicator: "#fa541c",
        },
        sidebar: {
          bg: "#ffffff",
          fg: "#262626",
          border: "#f0f0f0",
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
          sm: "0 1px 2px rgba(0,0,0,0.04)",
          md: "0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)",
          lg: "0 6px 16px -8px rgba(0,0,0,0.08), 0 9px 28px 0 rgba(0,0,0,0.05), 0 12px 48px 16px rgba(0,0,0,0.03)",
        },
        glow: "0 0 0 1px rgba(250,84,28,0.25)",
      },

      /* ----------------------------------
       * 10. 数据可视化
       * ---------------------------------- */
      charts: {
        categorical: [
          "#fa541c", // Volcano
          "#faad14", // Gold
          "#13c2c2", // Cyan
          "#52c41a", // Green
          "#2f54eb", // Geekblue
          "#722ed1", // Purple
          "#eb2f96", // Magenta
          "#fadb14", // Yellow
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
          default: "#26120c",
          hover: "#43140a",
          active: "#541d11",
          pressed: "#873800",
          fg: "#ffd8bf",

          subtle: "#1f120d",
          onSubtle: "#ffbb96",

          border: "#43140a",
          subtleBorder: "#2b1d11",
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
          default: "#49aa19",
          hover: "#389e0d",
          active: "#237804",
          pressed: "#135200",
          fg: "#f6ffed",

          subtle: "rgba(73,170,25,0.16)",
          onSubtle: "#b7eb8f",

          border: "rgba(73,170,25,0.4)",
          subtleBorder: "rgba(73,170,25,0.2)",
        },
        warning: {
          default: "#d89614",
          hover: "#faad14",
          active: "#aa7714",
          pressed: "#874d00",
          fg: "#fffbe6",

          subtle: "rgba(216,150,20,0.16)",
          onSubtle: "#ffe58f",

          border: "rgba(216,150,20,0.45)",
          subtleBorder: "rgba(216,150,20,0.25)",
        },
        error: {
          default: "#d9363e",
          hover: "#ff4d4f",
          active: "#a8071a",
          pressed: "#820014",
          fg: "#fff1f0",

          subtle: "rgba(217,54,62,0.18)",
          onSubtle: "#ffa39e",

          border: "rgba(217,54,62,0.45)",
          subtleBorder: "rgba(217,54,62,0.25)",
        },
        info: {
          default: "#fa541c",
          hover: "#ff7a45",
          active: "#d4380d",
          pressed: "#ad2102",
          fg: "#fff2e8",

          subtle: "rgba(250,84,28,0.16)",
          onSubtle: "#ffbb96",

          border: "rgba(250,84,28,0.45)",
          subtleBorder: "rgba(250,84,28,0.25)",
        },
      },

      text: {
        primary: "rgba(255,255,255,0.85)",
        secondary: "rgba(255,255,255,0.65)",
        tertiary: "rgba(255,255,255,0.45)",
        placeholder: "rgba(255,255,255,0.30)",
        disabled: "rgba(255,255,255,0.20)",
        inverse: "#000000",
        link: {
          default: "#fa541c",
          hover: "#ff7a45",
          active: "#d4380d",
        },
      },

      background: {
        canvas: "#141414",
        layout: "#000000",
        container: "#1f1f1f",
        surface: "#1f1f1f",
        elevated: "#2a2a2a",

        muted: {
          default: "#1f1f1f",
          fg: "rgba(255,255,255,0.65)",
        },
        accent: {
          default: "rgba(250,84,28,0.15)",
          fg: "#ffbb96",
        },

        glass: {
          bg: "rgba(20,20,20,0.6)",
          border: "rgba(255,255,255,0.08)",
        },

        mask: "rgba(0,0,0,0.45)",
        tooltip: "#434343",
      },

      form: {
        input: "#141414",
        border: "#434343",
        borderHover: "#595959",
        ring: "#fa541c",
        label: "rgba(255,255,255,0.85)",
        description: "rgba(255,255,255,0.45)",
        required: "#d9363e",
        addon: "#1f1f1f",
        readonly: "#141414",
      },

      border: {
        base: "#434343",
        strong: "#666666",
        subtle: "#303030",
        focus: "#fa541c",
      },

      action: {
        selection: "rgba(250,84,28,0.3)",
        disabled: {
          bg: "rgba(255,255,255,0.08)",
          text: "rgba(255,255,255,0.30)",
          border: "#434343",
        },
        skeleton: {
          base: "rgba(255,255,255,0.12)",
          shimmer: "rgba(255,255,255,0.08)",
        },
        scrollbar: {
          thumb: "rgba(255,255,255,0.20)",
          hover: "rgba(255,255,255,0.45)",
        },
      },

      component: {
        table: {
          headerBg: "#1f1f1f",
          rowHover: "rgba(250,84,28,0.08)",
          rowStriped: "#141414",
          border: "#303030",
        },
        tabs: {
          listBg: "#141414",
          triggerBg: "#1f1f1f",
          indicator: "#fa541c",
        },
        sidebar: {
          bg: "#000000",
          fg: "rgba(255,255,255,0.85)",
          border: "#303030",
          ring: "#fa541c",
          accent: "rgba(250,84,28,0.15)",
          onAccent: "#ffbb96",
        },
      },

      effects: {
        shadow: {
          sm: "0 1px 2px rgba(0,0,0,0.5)",
          md: "0 4px 12px rgba(0,0,0,0.55)",
          lg: "0 8px 24px rgba(0,0,0,0.65)",
        },
        glow: "0 0 0 1px rgba(250,84,28,0.3), 0 0 28px rgba(250,84,28,0.15)",
      },

      charts: {
        categorical: [
          "#fa541c",
          "#fadb14",
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
