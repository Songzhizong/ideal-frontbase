import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/packages/ui"

export function ComboboxBasicDemo() {
  return (
    <Combobox>
      <ComboboxInput placeholder="选择框架" showClear />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="react">React</ComboboxItem>
          <ComboboxItem value="vue">Vue</ComboboxItem>
          <ComboboxItem value="svelte">Svelte</ComboboxItem>
          <ComboboxItem value="solid">Solid</ComboboxItem>
          <ComboboxEmpty>无匹配结果</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default ComboboxBasicDemo
