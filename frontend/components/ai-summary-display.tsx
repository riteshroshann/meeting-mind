"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Description, Field, Label, Textarea } from "@headlessui/react"
import { Bot, Copy, CheckCircle, ListTodo, Volume2, VolumeX, Users, Clock } from "lucide-react"
import clsx from "clsx"

interface ActionItem {
  item: string
  assignee: string
  priority: string
  dueDate: string
}

interface AISummaryDisplayProps {
  isProcessing: boolean
  processingStep: string
  summary: string
  actionItems: ActionItem[]
  keyDecisions: string[]
  onCopy: (text: string) => void
  copySuccess: boolean
}

export function AISummaryDisplay({
  isProcessing,
  processingStep,
  summary,
  actionItems,
  keyDecisions,
  onCopy,
  copySuccess,
}: AISummaryDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    if (!summary) return

    speechSynthRef.current = new SpeechSynthesisUtterance(summary)
    speechSynthRef.current.lang = "en-US"
    speechSynthRef.current.onend = () => setIsSpeaking(false)
    speechSynthRef.current.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(speechSynthRef.current)
    setIsSpeaking(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return (
    <div className="w-full max-w-full">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <span className="text-purple-900">AI Summary</span>
            </div>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              Smart Analysis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="animate-pulse flex space-x-2 justify-center mb-2">
                  <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div
                    className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-purple-700">
                  {processingStep.includes("AI summary") || processingStep.includes("Generating")
                    ? processingStep
                    : "Waiting for AI analysis..."}
                </p>
              </div>
              <Skeleton className="h-4 w-full bg-purple-100" />
              <Skeleton className="h-4 w-3/4 bg-purple-100" />
              <Skeleton className="h-4 w-5/6 bg-purple-100" />
              <Skeleton className="h-4 w-2/3 bg-purple-100" />
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(summary)}
                  className="flex items-center gap-1 h-7 px-2 text-xs bg-white/80 border-purple-200 hover:bg-purple-50"
                >
                  <Copy className="h-3 w-3" />
                  {copySuccess ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTextToSpeech}
                  className="flex items-center gap-1 h-7 px-2 text-xs bg-white/80 border-purple-200 hover:bg-purple-50"
                  disabled={!summary}
                >
                  {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  {isSpeaking ? "Stop" : "Listen"}
                </Button>
              </div>

              <Field>
                <Label className="text-sm/6 font-medium text-purple-900">Meeting Insights</Label>
                <Description className="text-sm/6 text-purple-700/70">
                  AI-powered summary with key points and action items
                </Description>
                <Textarea
                  value={summary}
                  readOnly
                  className={clsx(
                    "mt-3 block w-full resize-none rounded-lg border-none bg-white/60 px-4 py-3 text-sm/6 text-purple-900",
                    "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-purple-500/25",
                    "backdrop-blur-sm shadow-inner",
                  )}
                  rows={6}
                />
              </Field>

              {/* Action Items */}
              {actionItems && actionItems.length > 0 && (
                <Field>
                  <Label className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <ListTodo className="h-4 w-4 text-purple-600" />
                    Action Items ({actionItems.length})
                  </Label>
                  <Description className="text-xs/5 text-purple-700/70 mb-2">
                    Tasks and assignments identified from the meeting
                  </Description>
                  <div className="space-y-2 max-h-[120px] overflow-y-auto">
                    {actionItems.map((item, index) => (
                      <div key={index} className="p-3 border border-purple-100 rounded-lg bg-white/80 shadow-sm">
                        <p className="font-medium text-gray-900 text-sm mb-2">{item.item}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs h-5 bg-blue-50 text-blue-700 border-blue-200">
                            <Users className="h-2 w-2 mr-1" />
                            {item.assignee}
                          </Badge>
                          <Badge variant="outline" className={`text-xs h-5 ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs h-5 bg-gray-50 text-gray-600 border-gray-200">
                            <Clock className="h-2 w-2 mr-1" />
                            {item.dueDate}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Field>
              )}

              {/* Key Decisions */}
              {keyDecisions && keyDecisions.length > 0 && (
                <Field>
                  <Label className="font-semibold text-gray-900 mb-2 text-sm">
                    Key Decisions ({keyDecisions.length})
                  </Label>
                  <Description className="text-xs/5 text-purple-700/70 mb-2">
                    Important decisions made during the meeting
                  </Description>
                  <div className="space-y-1 max-h-[100px] overflow-y-auto">
                    {keyDecisions.map((decision, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 bg-white/60 rounded border border-purple-100"
                      >
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{decision}</span>
                      </div>
                    ))}
                  </div>
                </Field>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Bot className="h-8 w-8 mx-auto mb-4 opacity-50" />
              <p className="text-sm">AI-generated summary will appear here</p>
              <p className="text-xs text-gray-400 mt-1">Upload and process an audio file to begin</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
