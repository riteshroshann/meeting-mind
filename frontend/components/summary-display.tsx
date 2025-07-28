"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Volume2, ListChecks, Lightbulb } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ActionItem {
  item: string
  assignee: string
  priority: string
  dueDate: string
}

interface SummaryDisplayProps {
  isProcessing: boolean
  processingStep: string
  summary: string
  actionItems: ActionItem[]
  keyDecisions: string[]
  onCopy: (text: string) => void
  copySuccess: boolean
}

export function SummaryDisplay({
  isProcessing,
  processingStep,
  summary,
  actionItems,
  keyDecisions,
  onCopy,
  copySuccess,
}: SummaryDisplayProps) {
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US" // Assuming AI summary is in English
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const showSkeleton = isProcessing && !summary && actionItems.length === 0 && keyDecisions.length === 0
  const showNoContent = !isProcessing && !summary && actionItems.length === 0 && keyDecisions.length === 0

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-green-600" />
          AI Summary & Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showNoContent ? (
          <Alert className="border-gray-200 bg-gray-50 text-gray-700">
            <AlertDescription className="text-sm">
              AI-generated summary, action items, and key decisions will appear here after processing.
            </AlertDescription>
          </Alert>
        ) : showSkeleton ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            {/* Summary Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Summary</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onCopy(summary)} className="h-6 px-2 text-xs">
                    <Copy className="h-3 w-3 mr-1" />
                    {copySuccess ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => speakText(summary)} className="h-6 px-2 text-xs">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Listen
                  </Button>
                </div>
              </div>
              <Textarea
                value={summary}
                readOnly
                className="min-h-[150px] resize-none text-sm bg-purple-50/50 border-purple-200"
                placeholder="AI-generated summary will appear here..."
              />
            </div>

            {/* Action Items */}
            {actionItems.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Action Items
                </h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {actionItems.map((item, index) => (
                    <li key={index}>
                      <strong>{item.item}</strong> (Assignee: {item.assignee}, Priority: {item.priority}, Due:{" "}
                      {item.dueDate})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Decisions */}
            {keyDecisions.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Key Decisions
                </h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {keyDecisions.map((decision, index) => (
                    <li key={index}>{decision}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
