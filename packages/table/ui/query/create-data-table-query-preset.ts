import { normalizeDataTablePresetQuery } from "./normalize"
import type { DataTablePresetQueryProps, DataTableQueryFieldId } from "./types"

export function createDataTableQueryPreset<
  TFilterSchema,
  TFieldId extends DataTableQueryFieldId = DataTableQueryFieldId,
>(
  options: DataTablePresetQueryProps<TFilterSchema, TFieldId>,
): DataTablePresetQueryProps<TFilterSchema, TFieldId> {
  // 运行时校验在 normalize 中完成，这里保留原始结构给调用方。
  void normalizeDataTablePresetQuery(options)
  return options
}
