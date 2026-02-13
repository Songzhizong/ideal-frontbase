import type { ReactNode } from "react"
import type {
  DataTablePresetQueryProps,
  DataTableQueryField,
  DataTableQueryFieldId,
  DataTableQueryFieldLabelMode,
  DataTableQueryLayoutMode,
  DataTableQuerySchema,
  DataTableQuerySearchConfig,
} from "./types"

interface NormalizedSearchConfig<TFieldId extends DataTableQueryFieldId> {
  mode: "simple" | "advanced"
  searchableFieldIds: TFieldId[]
  pickerFieldIds: TFieldId[]
  defaultFieldId: TFieldId
  debounceMs: number
  placeholder?: string | undefined
  className?: string | undefined
}

export interface NormalizedDataTablePresetQuery<
  TFilterSchema,
  TFieldId extends DataTableQueryFieldId = DataTableQueryFieldId,
> {
  className?: string
  schema: {
    fields: Array<DataTableQueryField<TFilterSchema, unknown, TFieldId>>
    fieldMap: Map<TFieldId, DataTableQueryField<TFilterSchema, unknown, TFieldId>>
    search: NormalizedSearchConfig<TFieldId> | null
  }
  layout: {
    mode: DataTableQueryLayoutMode
    inlineQueryGrow: boolean
    primaryFieldIds: TFieldId[]
    secondaryFieldIds: TFieldId[]
    primaryFieldLabelMode: DataTableQueryFieldLabelMode
    secondaryFieldLabelMode: DataTableQueryFieldLabelMode
    showSearch: boolean
    secondaryCollapsible: boolean
    secondaryDefaultExpanded: boolean
    secondaryExpanded?: boolean | undefined
    onSecondaryExpandedChange?: ((expanded: boolean) => void) | undefined
    chipsVisible: boolean
    chipsShowClearAll: boolean
    chipsClearAllLabel?: string | undefined
  }
  slots: {
    actionsLeft?: ReactNode
    actionsRight?: ReactNode
  }
}

function isFieldSearchEnabled<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown, DataTableQueryFieldId>,
) {
  if (field.search?.enabled != null) return field.search.enabled
  return field.kind === "text"
}

function isFieldSearchPickerVisible<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown, DataTableQueryFieldId>,
) {
  if (field.search?.pickerVisible != null) return field.search.pickerVisible
  return true
}

function supportsSearchKind<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown, DataTableQueryFieldId>,
): boolean {
  return field.kind !== "custom"
}

function sortFieldsBySearchOrder<TFilterSchema, TFieldId extends DataTableQueryFieldId>(
  fields: readonly DataTableQueryField<TFilterSchema, unknown, TFieldId>[],
): DataTableQueryField<TFilterSchema, unknown, TFieldId>[] {
  return [...fields]
    .map((field, index) => ({ field, index }))
    .sort((a, b) => {
      const leftOrder = a.field.search?.order ?? Number.MAX_SAFE_INTEGER
      const rightOrder = b.field.search?.order ?? Number.MAX_SAFE_INTEGER
      if (leftOrder === rightOrder) {
        return a.index - b.index
      }
      return leftOrder - rightOrder
    })
    .map((item) => item.field)
}

function ensureUniqueFieldIds<TFilterSchema, TFieldId extends DataTableQueryFieldId>(
  fields: readonly DataTableQueryField<TFilterSchema, unknown, TFieldId>[],
) {
  const seen = new Set<string>()
  for (const field of fields) {
    const id = String(field.id)
    if (seen.has(id)) {
      throw new Error(`[DataTableQuerySchema] duplicated field id: "${id}"`)
    }
    seen.add(id)
  }
}

function resolveSearchConfig<TFilterSchema, TFieldId extends DataTableQueryFieldId>(
  schema: DataTableQuerySchema<TFilterSchema, TFieldId>,
  fieldMap: Map<TFieldId, DataTableQueryField<TFilterSchema, unknown, TFieldId>>,
): NormalizedSearchConfig<TFieldId> | null {
  if (schema.search === false) return null
  const rawSearch: DataTableQuerySearchConfig<TFieldId> = schema.search ?? {}
  const searchableFields = sortFieldsBySearchOrder(
    schema.fields.filter((field) => isFieldSearchEnabled(field)),
  )
  if (searchableFields.length === 0) return null

  for (const targetField of searchableFields) {
    if (targetField.binding.mode !== "single") {
      throw new Error(
        `[DataTableQuerySchema] search-enabled field "${String(targetField.id)}" must use single binding`,
      )
    }
    if (!supportsSearchKind(targetField)) {
      throw new Error(
        `[DataTableQuerySchema] search-enabled field "${String(targetField.id)}" kind "${targetField.kind}" is not supported`,
      )
    }
  }

  const searchableFieldIds = searchableFields.map((field) => field.id)
  const pickerFieldIds = searchableFields
    .filter((field) => isFieldSearchPickerVisible(field))
    .map((field) => field.id)
  const defaultFieldId = rawSearch.defaultFieldId ?? searchableFieldIds[0]
  if (defaultFieldId == null || !searchableFieldIds.includes(defaultFieldId)) {
    throw new Error(
      `[DataTableQuerySchema] search.defaultFieldId must be included in search-enabled fields`,
    )
  }
  if (!fieldMap.has(defaultFieldId)) {
    throw new Error(
      `[DataTableQuerySchema] search.defaultFieldId "${String(defaultFieldId)}" not found`,
    )
  }
  const mode = rawSearch.mode ?? (searchableFieldIds.length > 1 ? "advanced" : "simple")

  return {
    mode,
    searchableFieldIds,
    pickerFieldIds,
    defaultFieldId,
    debounceMs: rawSearch.debounceMs ?? 300,
    placeholder: rawSearch.placeholder,
    className: rawSearch.className,
  }
}

function resolveLayoutFieldIds<TFilterSchema, TFieldId extends DataTableQueryFieldId>(
  fields: readonly DataTableQueryField<TFilterSchema, unknown, TFieldId>[],
  ids: readonly TFieldId[] | undefined,
  placement: "primary" | "secondary",
): TFieldId[] {
  if (ids != null) return [...ids]
  return fields
    .filter((field) => (field.ui?.panel ?? "primary") === placement)
    .map((field) => field.id)
}

function ensureLayoutFieldIdsExist<TFilterSchema, TFieldId extends DataTableQueryFieldId>(
  ids: TFieldId[],
  fieldMap: Map<TFieldId, DataTableQueryField<TFilterSchema, unknown, TFieldId>>,
  slot: "primary" | "secondary",
) {
  for (const fieldId of ids) {
    if (!fieldMap.has(fieldId)) {
      throw new Error(
        `[DataTableQuerySchema] layout.${slot}.fieldIds contains unknown field "${String(fieldId)}"`,
      )
    }
  }
}

export function normalizeDataTablePresetQuery<
  TFilterSchema,
  TFieldId extends DataTableQueryFieldId = DataTableQueryFieldId,
>(
  props: DataTablePresetQueryProps<TFilterSchema, TFieldId>,
): NormalizedDataTablePresetQuery<TFilterSchema, TFieldId> {
  ensureUniqueFieldIds(props.schema.fields)
  const fields = [...props.schema.fields]
  const fieldMap = new Map<TFieldId, DataTableQueryField<TFilterSchema, unknown, TFieldId>>(
    fields.map((field) => [field.id, field]),
  )
  const search = resolveSearchConfig(props.schema, fieldMap)
  const mode = props.layout?.mode ?? "inline"
  const primaryFieldIds = resolveLayoutFieldIds(fields, props.layout?.primary?.fieldIds, "primary")
  const secondaryFieldIds = resolveLayoutFieldIds(
    fields,
    props.layout?.secondary?.fieldIds,
    "secondary",
  )

  ensureLayoutFieldIdsExist(primaryFieldIds, fieldMap, "primary")
  ensureLayoutFieldIdsExist(secondaryFieldIds, fieldMap, "secondary")

  return {
    ...(props.className ? { className: props.className } : {}),
    schema: {
      fields,
      fieldMap,
      search,
    },
    layout: {
      mode,
      inlineQueryGrow: props.layout?.inline?.queryGrow ?? true,
      primaryFieldIds,
      secondaryFieldIds,
      primaryFieldLabelMode: props.layout?.primary?.fieldLabelMode ?? "inside",
      secondaryFieldLabelMode: props.layout?.secondary?.fieldLabelMode ?? "top",
      showSearch: props.layout?.primary?.search ?? search !== null,
      secondaryCollapsible: props.layout?.secondary?.collapsible ?? true,
      secondaryDefaultExpanded: props.layout?.secondary?.defaultExpanded ?? false,
      secondaryExpanded: props.layout?.secondary?.expanded,
      onSecondaryExpandedChange: props.layout?.secondary?.onExpandedChange,
      chipsVisible: props.layout?.chips?.visible ?? true,
      chipsShowClearAll: props.layout?.chips?.showClearAll ?? true,
      chipsClearAllLabel: props.layout?.chips?.clearAllLabel,
    },
    slots: {
      actionsLeft: props.slots?.actionsLeft,
      actionsRight: props.slots?.actionsRight,
    },
  }
}
