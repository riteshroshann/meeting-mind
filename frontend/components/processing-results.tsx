"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Languages, Brain, CheckCircle, Clock, User, AlertCircle, Download, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ActionItem {
  item: string
  assignee: string
  priority: "High" | "Medium" | "Low"
  dueDate: string
}

interface ProcessingResultsProps {
  data: {
    transcript: string
    translation: string
    summary: string
    actionItems: ActionItem[]
    keyDecisions: string[]
  }
  metadata: {
    sourceLanguage: string
    targetLanguage: string
    audioFormat: string
    processedAt: string
    preMeetingNotesProvided: boolean
  }
}

export default function ProcessingResults({ data, metadata }: ProcessingResultsProps) {
  const [activeTab, setActiveTab] = useState<"transcript" | "translation" | "summary" | "actions">("summary")

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
    })
  }

  const handleExport = () => {
    const exportData = {
      ...data,
      metadata,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-analysis-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: "Meeting analysis has been exported as JSON file.",
    })
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Analysis Results</h2>
          <p className="text-sm text-gray-500 mt-1">Processed on {formatDate(metadata.processedAt)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(JSON.stringify(data, null, 2), "Full analysis")}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy All
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Processing Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Languages</p>
                <p className="text-xs text-gray-500">
                  {metadata.sourceLanguage.toUpperCase()} → {metadata.targetLanguage.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Audio Format</p>
                <p className="text-xs text-gray-500">{metadata.audioFormat.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Processed</p>
                <p className="text-xs text-gray-500">{formatDate(metadata.processedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Pre-meeting Notes</p>
                <p className="text-xs text-gray-500">
                  {metadata.preMeetingNotesProvided ? "Included" : "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "summary", label: "AI Summary", icon: Brain },
          { id: "actions", label: "Action Items", icon: CheckCircle },
          { id: "transcript", label: "Transcript", icon: FileText },
          { id: "translation", label: "Translation", icon: Languages },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "summary" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI-Generated Summary
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleCopy(data.summary, "Summary")}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <CardDescription>Comprehensive analysis of the meeting content</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {data.summary || "No summary available"}
                  </p>
                </div>
              </ScrollArea>

              {data.keyDecisions && data.keyDecisions.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                      Key Decisions
                    </h4>
                    <ul className="space-y-2">
                      {data.keyDecisions.map((decision, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{decision}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "actions" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Action Items ({data.actionItems?.length || 0})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      data.actionItems
                        ?.map(
                          (item) =>
                            `• ${item.item} (Assignee: ${item.assignee}, Priority: ${item.priority}, Due: ${item.dueDate})`,
                        )
                        .join("\n") || "",
                      "Action items",
                    )
                  }
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
              </div>
              <CardDescription>Actionable tasks extracted from the meeting</CardDescription>
            </CardHeader>
            <CardContent>
              {data.actionItems && data.actionItems.length > 0 ? (
                <div className="space-y-4">
                  {data.actionItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-medium text-gray-900 flex-1">{item.item}</p>
                        <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{item.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No action items identified in this meeting.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "transcript" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Original Transcript ({metadata.sourceLanguage.toUpperCase()})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleCopy(data.transcript, "Transcript")}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <CardDescription>Speech-to-text transcription of the audio</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                  {data.transcript || "No transcript available"}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {activeTab === "translation" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-green-500" />
                  Translation ({metadata.targetLanguage.toUpperCase()})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleCopy(data.translation, "Translation")}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <CardDescription>Translated content in the target language</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                  {data.translation || "No translation available"}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
