import { ChevronRight, Code2 } from "lucide-react"
import { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useResolvedTheme } from "@/packages/theme-system"
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CopyButton,
} from "@/packages/ui"
import { cn } from "@/packages/ui-utils"

interface DocCodeBlockProps {
  code: string
  language?: string | undefined
  defaultOpen?: boolean | undefined
  className?: string | undefined
}

const CODE_FONT_FAMILY = '"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace'

function getLanguageToken(language: string | undefined) {
  const token = language?.trim().split(/\s+/)[0]?.toLowerCase()
  return token && token.length > 0 ? token : "text"
}

function getLanguageLabel(language: string | undefined) {
  const token = language?.trim().split(/\s+/)[0]
  return token && token.length > 0 ? token : "text"
}

export function DocCodeBlock({
  code,
  language,
  defaultOpen = false,
  className,
}: DocCodeBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const resolvedTheme = useResolvedTheme()
  const isDark = resolvedTheme === "dark"
  const languageToken = getLanguageToken(language)
  const languageLabel = getLanguageLabel(language)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("overflow-hidden rounded-lg border border-border/70", className)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <Code2 className="size-3.5" />
          <span className="font-code">{languageLabel}</span>
        </div>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isOpen ? "收起代码" : "查看代码"}
            <ChevronRight className={cn("size-3.5 transition-transform", isOpen && "rotate-90")} />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="relative">
          <CopyButton
            value={code}
            variant="ghost"
            size="md"
            shape="square"
            iconOnly
            className="absolute right-3 top-3 z-10 h-7 w-7 border border-border/60 bg-background/75 text-muted-foreground backdrop-blur-sm hover:bg-background hover:text-foreground"
          />
          <SyntaxHighlighter
            language={languageToken}
            style={isDark ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              padding: "1rem 3.25rem 1rem 1rem",
              fontSize: "0.8125rem",
              lineHeight: "1.65",
              overflowX: "auto",
              tabSize: "2",
              fontFamily: CODE_FONT_FAMILY,
            }}
            codeTagProps={{
              style: {
                fontFamily: CODE_FONT_FAMILY,
                fontFeatureSettings: '"tnum" 1',
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
