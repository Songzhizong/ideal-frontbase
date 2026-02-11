import { useEffect, useMemo, useState } from "react"
import { DiffViewer, EmptyState } from "@/features/shared/components"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type { EvaluationRunDetail } from "../../types"

interface EvalSideBySideTabProps {
  run: EvaluationRunDetail
  saving: boolean
  onSaveReview: (payload: {
    sampleId: string
    scoreA: number
    scoreB: number
    winner: "A" | "B" | "Tie"
    note: string
  }) => Promise<void>
}

export function EvalSideBySideTab({ run, saving, onSaveReview }: EvalSideBySideTabProps) {
  const [sampleId, setSampleId] = useState<string>(run.comparisonSamples[0]?.sampleId ?? "")
  const [scoreA, setScoreA] = useState<number>(4)
  const [scoreB, setScoreB] = useState<number>(4)
  const [winner, setWinner] = useState<"A" | "B" | "Tie">("Tie")
  const [note, setNote] = useState("")

  const currentSample = useMemo(() => {
    return run.comparisonSamples.find((sample) => sample.sampleId === sampleId) ?? null
  }, [run.comparisonSamples, sampleId])

  useEffect(() => {
    if (!currentSample) {
      return
    }
    setScoreA(currentSample.scoreA ?? 4)
    setScoreB(currentSample.scoreB ?? 4)
    setWinner(currentSample.winner ?? "Tie")
    setNote(currentSample.note ?? "")
  }, [currentSample])

  if (run.comparisonSamples.length === 0) {
    return (
      <EmptyState
        title="当前评估类型不支持 Side-by-Side"
        description="仅对比评估会展示双列响应和人工评分区。"
      />
    )
  }

  function renderResponse(title: string, response: string, highlight: boolean) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-2 text-sm font-semibold">{title}</p>
        <p className={highlight ? "text-sm text-foreground" : "text-sm text-muted-foreground"}>
          {response}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-2">
          <Label>样本选择</Label>
          <Select value={sampleId} onValueChange={setSampleId}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="选择样本" />
            </SelectTrigger>
            <SelectContent>
              {run.comparisonSamples.map((sample) => (
                <SelectItem
                  key={sample.sampleId}
                  value={sample.sampleId}
                  className="cursor-pointer"
                >
                  {sample.sampleId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentSample ? (
        <>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Prompt</p>
            <p className="mt-2 text-sm">{currentSample.prompt}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {renderResponse("版本 A", currentSample.responseA, winner === "A")}
            {renderResponse("版本 B", currentSample.responseB, winner === "B")}
          </div>

          <DiffViewer
            before={currentSample.responseA}
            after={currentSample.responseB}
            beforeTitle="Response A"
            afterTitle="Response B"
            splitView
          />

          <div className="grid gap-4 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>A 评分（1-5）</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={scoreA}
                onChange={(event) => setScoreA(Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>B 评分（1-5）</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={scoreB}
                onChange={(event) => setScoreB(Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Winner</Label>
              <Select
                value={winner}
                onValueChange={(value) => setWinner(value as "A" | "B" | "Tie")}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A" className="cursor-pointer">
                    A
                  </SelectItem>
                  <SelectItem value="B" className="cursor-pointer">
                    B
                  </SelectItem>
                  <SelectItem value="Tie" className="cursor-pointer">
                    Tie
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="评分说明"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={saving || !currentSample}
              onClick={() => {
                if (!currentSample) {
                  return
                }
                void onSaveReview({
                  sampleId: currentSample.sampleId,
                  scoreA,
                  scoreB,
                  winner,
                  note,
                })
              }}
              className="cursor-pointer"
            >
              保存人工评分
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
