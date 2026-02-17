import { ButtonLink } from "@/packages/ui"

export function ButtonMdLinkDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonLink to="/components/button">站内链接</ButtonLink>
      <ButtonLink to="/components/button" target="_blank">
        新标签页打开
      </ButtonLink>
      <ButtonLink to="/components/button" disabled>
        禁用链接
      </ButtonLink>
      <ButtonLink href="https://soybeanjs.cn">外部链接</ButtonLink>
    </div>
  )
}

export default ButtonMdLinkDemo
