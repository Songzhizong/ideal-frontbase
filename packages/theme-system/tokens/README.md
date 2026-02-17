# Theme Token Generation

`packages/theme-system/tokens/schema/*.json` 是当前主题 token 生成的唯一输入源。

## 目标

- 从 schema 生成 `styles/variables.generated.css`。
- 从 schema 生成 `styles/theme.generated.css`。
- 生成 `tokens/generated/theme-token-mappings.generated.ts`，供运行时按 schema 映射与类型校验复用。
- 生成 `tokens/generated/theme-root-fallbacks.generated.ts`，供运行时复用 schema 默认值。

## 命令

```bash
pnpm -C packages/theme-system tokens:generate
pnpm -C packages/theme-system tokens:check
pnpm -C packages/theme-system tokens:consistency-check
```

`tokens:generate` 会先根据默认主题预设自动同步 `root-fallbacks.json`，再生成其余产物。  
`tokens:check` 可用于 CI：当生成产物与 schema 不一致时退出码为 `1`。
`tokens:consistency-check` 用于校验默认主题（`defaultThemeSettings.activePreset` 的 light 模式）与 `root-fallbacks` 的重叠 token 值一致。
