import { ChevronDown } from "lucide-react"
import { Button } from "@/packages/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/packages/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/packages/ui/popover"
import { cn } from "@/packages/ui-utils"
import type { DataTableI18n } from "../config"
import { useDataTableConfig } from "../config"
import type { AdvancedSearchField } from "./types"
import { getFieldTypeLabel } from "./utils"

export interface DataTableAdvancedFieldPickerProps<TFilterSchema> {
  fieldPickerOpen: boolean
  onFieldPickerOpenChange: (nextOpen: boolean) => void
  activeField: AdvancedSearchField<TFilterSchema> | null
  searchableFields: Array<AdvancedSearchField<TFilterSchema>>
  onSelectField: (field: AdvancedSearchField<TFilterSchema>) => void
  i18n?: Pick<DataTableI18n, "advancedSearch">
}

export function DataTableAdvancedFieldPicker<TFilterSchema>({
  fieldPickerOpen,
  onFieldPickerOpenChange,
  activeField,
  searchableFields,
  onSelectField,
  i18n: i18nOverrides,
}: DataTableAdvancedFieldPickerProps<TFilterSchema>) {
  const { i18n: globalI18n } = useDataTableConfig()
  const i18n = i18nOverrides ?? globalI18n
  const fieldButtonClassName = cn(
    "h-7 shrink-0 gap-1 px-2 text-xs font-medium transition-colors",
    activeField
      ? "bg-primary/10 text-primary hover:bg-primary/15"
      : "bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground",
  )
  const fieldChevronClassName = cn(
    "h-3.5 w-3.5 transition-colors",
    activeField ? "text-primary/80" : "text-muted-foreground",
  )

  return (
    <Popover open={fieldPickerOpen} onOpenChange={onFieldPickerOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className={fieldButtonClassName}>
          <span className="max-w-24 truncate">
            {activeField?.label ?? i18n.advancedSearch.fieldTriggerText}
          </span>
          <ChevronDown className={fieldChevronClassName} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput
            placeholder={i18n.advancedSearch.fieldSearchPlaceholder}
            className="border-0 shadow-none focus-visible:ring-0 focus-visible:outline-none"
          />
          <CommandList>
            <CommandEmpty>{i18n.advancedSearch.fieldEmptyText}</CommandEmpty>
            <CommandGroup heading={i18n.advancedSearch.fieldGroupLabel}>
              {searchableFields.map((field) => (
                <CommandItem key={String(field.key)} onSelect={() => onSelectField(field)}>
                  <span className="truncate">{field.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {getFieldTypeLabel(field.type, i18n.advancedSearch)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
