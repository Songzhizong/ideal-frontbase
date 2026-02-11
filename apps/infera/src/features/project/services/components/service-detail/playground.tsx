import { LoaderCircle, Send } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui/collapsible"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Switch } from "@/packages/ui/switch"
import { Textarea } from "@/packages/ui/textarea"
import { useProjectServiceActions } from "../../hooks"
import type { ProjectServiceDetail } from "../../types"
import { toErrorMessage } from "../service-formatters"

interface PlaygroundTabProps {
  tenantId: string
  projectId: string
  service: ProjectServiceDetail
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  tokens: number
}

export function PlaygroundTab({ tenantId, projectId, service }: PlaygroundTabProps) {
  const actions = useProjectServiceActions({ tenantId, projectId, serviceId: service.serviceId })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [prompt, setPrompt] = useState("")
  const [modelVersionId, setModelVersionId] = useState(service.playgroundConfig.modelVersionId)
  const [revisionId, setRevisionId] = useState(service.playgroundConfig.revisionId)
  const [temperature, setTemperature] = useState(service.playgroundConfig.temperature)
  const [topP, setTopP] = useState(service.playgroundConfig.topP)
  const [maxTokens, setMaxTokens] = useState(service.playgroundConfig.maxTokens)
  const [stop, setStop] = useState(service.playgroundConfig.stop)
  const [presencePenalty, setPresencePenalty] = useState(service.playgroundConfig.presencePenalty)
  const [stream, setStream] = useState(service.playgroundConfig.stream)
  const [recordPromptResponse, setRecordPromptResponse] = useState(
    service.playgroundConfig.recordPromptResponse,
  )
  const [rawRequest, setRawRequest] = useState("")
  const [rawResponse, setRawResponse] = useState("")

  const streamTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (streamTimer.current !== null) {
        window.clearInterval(streamTimer.current)
      }
    }
  }, [])

  const tokenUsage = useMemo(() => {
    const sessionPrompt = messages
      .filter((item) => item.role === "user")
      .reduce((sum, item) => sum + item.tokens, 0)
    const sessionCompletion = messages
      .filter((item) => item.role === "assistant")
      .reduce((sum, item) => sum + item.tokens, 0)
    return {
      prompt: service.playgroundTokenUsage.promptTokens + sessionPrompt,
      completion: service.playgroundTokenUsage.completionTokens + sessionCompletion,
      total: service.playgroundTokenUsage.totalTokens + sessionPrompt + sessionCompletion,
    }
  }, [messages, service.playgroundTokenUsage])

  const revisionOptions = service.revisions.map((item) => item.revisionId)

  const sendPrompt = async () => {
    const trimmed = prompt.trim()
    if (!trimmed) {
      toast.error("请输入 Prompt")
      return
    }

    setMessages((current) => [
      ...current,
      {
        id: `user-${Math.random().toString(36).slice(2, 8)}`,
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
        tokens: Math.max(4, Math.ceil(trimmed.length / 4)),
      },
    ])
    setPrompt("")

    try {
      const result = await actions.runPlaygroundMutation.mutateAsync({
        tenantId,
        projectId,
        serviceId: service.serviceId,
        prompt: trimmed,
        revisionId,
        temperature,
        topP,
        maxTokens,
        stream,
      })

      setRawRequest(result.request)
      setRawResponse(result.response)

      if (stream) {
        const tempId = `assistant-${Math.random().toString(36).slice(2, 8)}`
        setMessages((current) => [
          ...current,
          {
            id: tempId,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString(),
            tokens: result.usage.totalTokens,
          },
        ])

        const content = result.message.content
        let cursor = 0
        if (streamTimer.current !== null) {
          window.clearInterval(streamTimer.current)
        }
        streamTimer.current = window.setInterval(() => {
          cursor += 1
          setMessages((current) =>
            current.map((item) =>
              item.id === tempId
                ? {
                    ...item,
                    content: content.slice(0, cursor),
                  }
                : item,
            ),
          )
          if (cursor >= content.length && streamTimer.current !== null) {
            window.clearInterval(streamTimer.current)
            streamTimer.current = null
          }
        }, 20)
      } else {
        setMessages((current) => [
          ...current,
          {
            id: result.message.id,
            role: "assistant",
            content: result.message.content,
            createdAt: result.message.createdAt,
            tokens: result.usage.totalTokens,
          },
        ])
      }
    } catch (error: unknown) {
      toast.error(toErrorMessage(error))
    }
  }

  return (
    <div className="space-y-4">
      {service.env === "Prod" ? (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
          {service.compliance.notice}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Chat</p>
            <Badge variant="outline">{service.name}</Badge>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-auto rounded-md border border-border/50 bg-muted/20 p-3">
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground">发送第一个 Prompt 开始调试服务。</p>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "typography-chat-message rounded-lg bg-primary/10 p-3"
                    : "typography-chat-message rounded-lg bg-muted p-3"
                }
              >
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{message.role === "user" ? "User" : "Assistant"}</span>
                  <span>
                    {new Date(message.createdAt).toLocaleTimeString("zh-CN", { hour12: false })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                  {actions.runPlaygroundMutation.isPending && message.role === "assistant" ? (
                    <span className="inline-block h-4 w-2 animate-pulse bg-foreground/70 align-middle" />
                  ) : null}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <Textarea
              rows={4}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="输入 Prompt，按 Enter 发送（Shift+Enter 换行）"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  void sendPrompt()
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                className="cursor-pointer"
                disabled={actions.runPlaygroundMutation.isPending}
                onClick={() => void sendPrompt()}
              >
                {actions.runPlaygroundMutation.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                发送
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border/50 bg-card p-4">
          <p className="text-sm font-medium">参数面板</p>

          <div className="space-y-2">
            <Label>model_version_id</Label>
            <Input
              value={modelVersionId}
              onChange={(event) => setModelVersionId(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>revision</Label>
            <Select value={revisionId} onValueChange={setRevisionId}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {revisionOptions.map((revision) => (
                  <SelectItem key={revision} value={revision} className="cursor-pointer">
                    {revision}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <NumberField
              label="temperature"
              value={temperature}
              setValue={setTemperature}
              min={0}
              max={2}
              step={0.1}
            />
            <NumberField
              label="top_p"
              value={topP}
              setValue={setTopP}
              min={0}
              max={1}
              step={0.05}
            />
            <NumberField
              label="max_tokens"
              value={maxTokens}
              setValue={setMaxTokens}
              min={1}
              max={8192}
              step={1}
            />
            <NumberField
              label="presence_penalty"
              value={presencePenalty}
              setValue={setPresencePenalty}
              min={-2}
              max={2}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label>stop</Label>
            <Input value={stop} onChange={(event) => setStop(event.target.value)} />
          </div>

          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">stream</Label>
              <Switch checked={stream} onCheckedChange={setStream} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">记录 Prompt/Response</Label>
              <Switch
                checked={recordPromptResponse}
                onCheckedChange={setRecordPromptResponse}
                disabled={service.compliance.prodRecordLocked}
              />
            </div>
            {service.compliance.prodRecordLocked ? (
              <p className="text-xs text-muted-foreground">生产环境默认关闭并锁定该配置。</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-3 text-xs">
            <p className="mb-1 text-muted-foreground">Token 用量</p>
            <p className="font-mono">Prompt: {tokenUsage.prompt}</p>
            <p className="font-mono">Completion: {tokenUsage.completion}</p>
            <p className="font-mono">Total: {tokenUsage.total}</p>
          </div>
        </div>
      </div>

      <Collapsible className="rounded-lg border border-border/50 bg-card p-4">
        <CollapsibleTrigger className="cursor-pointer text-sm font-medium">
          Raw Request / Response
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Request</p>
            <pre className="max-h-64 overflow-auto rounded-md border border-border/50 bg-muted/20 p-3 text-xs">
              {rawRequest || "暂无请求"}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Response</p>
            <pre className="max-h-64 overflow-auto rounded-md border border-border/50 bg-muted/20 p-3 text-xs">
              {rawResponse || "暂无响应"}
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function NumberField({
  label,
  value,
  setValue,
  min,
  max,
  step,
}: {
  label: string
  value: number
  setValue: (value: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => setValue(Number(event.target.value))}
      />
    </div>
  )
}
