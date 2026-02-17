import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/packages/ui"

export function ComboboxGroupedDemo() {
  return (
    <Combobox>
      <ComboboxInput placeholder="选择部署目标" showClear />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxLabel>测试环境</ComboboxLabel>
            <ComboboxItem value="dev">Development</ComboboxItem>
            <ComboboxItem value="test">Testing</ComboboxItem>
          </ComboboxGroup>

          <ComboboxSeparator />

          <ComboboxGroup>
            <ComboboxLabel>生产环境</ComboboxLabel>
            <ComboboxItem value="staging">Staging</ComboboxItem>
            <ComboboxItem value="prod">Production</ComboboxItem>
          </ComboboxGroup>

          <ComboboxEmpty>无匹配结果</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default ComboboxGroupedDemo
