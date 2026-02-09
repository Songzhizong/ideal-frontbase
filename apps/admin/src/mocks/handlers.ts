import { mockRegistry } from "@/packages/mock-core"

/**
 * 依赖注入机制：
 * 使用 Vite 的 import.meta.glob 自动发现并执行 features 与 packages 目录下的 .mock.ts 文件。
 * 每个 .mock.ts 文件通过调用 mockRegistry.register() 主动将其处理器注入。
 */
import.meta.glob(["../features/**/*.mock.ts", "../../../../packages/**/*.mock.ts"], {
  eager: true,
})

/**
 * 导出合并后的所有处理器
 */
export const handlers = mockRegistry.getHandlers()
