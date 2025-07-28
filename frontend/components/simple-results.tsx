"use client"

import { Description, Field, Label, Textarea } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, RefreshCw, Download, FileText, Languages, Brain } from "lucide-react"
import clsx from "clsx"

// Define a type for the processed data
interface ProcessedData {
  transcript: string
  summary: string
  translatedText: string
  actionItems: Array<{
    item: string
    assignee: string
    priority: string
    dueDate: string
  }>
}

interface SimpleResultsProps {
  fileName: string
  language: string
  targetLanguage: string
  preMeetingNotes: string
  onNewSession: () => void
  processedData: ProcessedData
}

export function SimpleResults({
  fileName,
  language,
  targetLanguage,
  preMeetingNotes,
  onNewSession,
  processedData,
}: SimpleResultsProps) {
  const { transcript, summary, translatedText, actionItems } = processedData

  // Format action items as text
  const actionItemsText =
    actionItems && actionItems.length > 0
      ? actionItems
          .map(
            (item, index) =>
              `${index + 1}. ${item.item}\n   Assignee: ${item.assignee}\n   Priority: ${item.priority}\n   Due: ${item.dueDate}`,
          )
          .join("\n\n")
      : "No specific action items identified from this audio."

  const combinedSummaryAndNotes = `${summary}\n\n${
    preMeetingNotes ? `Pre-Meeting Notes:\n${preMeetingNotes}\n\n` : ""
  }Action Items:\n${actionItemsText}`

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-white">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Processing Complete</span>
              </CardTitle>
              <CardDescription className="text-white/70">{fileName} • Powered by Bhashini + Gemini AI</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={onNewSession}
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Process Another File
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results Content */}
      <div className="grid gap-6">
        {/* Original Transcript */}
        <div className="w-full px-4">
          <Field>
            <Label className="text-sm/6 font-medium text-white flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Original Transcript ({language.toUpperCase()})</span>
            </Label>
            <Description className="text-sm/6 text-white/50">
              Speech-to-text conversion powered by Bhashini ASR
            </Description>
            <Textarea
              readOnly
              value={transcript || "No transcript available"}
              className={clsx(
                "mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                "focus:outline-none min-h-[200px]",
              )}
              rows={8}
            />
          </Field>
        </div>

        {/* Translated Text */}
        {translatedText && (
          <div className="w-full px-4">
            <Field>
              <Label className="text-sm/6 font-medium text-white flex items-center space-x-2">
                <Languages className="w-4 h-4" />
                <span>Translated Text ({targetLanguage.toUpperCase()})</span>
              </Label>
              <Description className="text-sm/6 text-white/50">Translation powered by Bhashini NMT</Description>
              <Textarea
                readOnly
                value={translatedText}
                className={clsx(
                  "mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                  "focus:outline-none min-h-[200px]",
                )}
                rows={8}
              />
            </Field>
          </div>
        )}

        {/* AI Summary and Action Items */}
        <div className="w-full px-4">
          <Field>
            <Label className="text-sm/6 font-medium text-white flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Summary & Action Items</span>
            </Label>
            <Description className="text-sm/6 text-white/50">
              Intelligent analysis powered by Google Gemini AI
            </Description>
            <Textarea
              readOnly
              value={combinedSummaryAndNotes}
              className={clsx(
                "mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                "focus:outline-none min-h-[300px]",
              )}
              rows={12}
            />
          </Field>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button className="bg-white text-black hover:bg-white/90">
          <Download className="w-4 h-4 mr-2" />
          Download Results
        </Button>
      </div>
    </div>
  )
}
