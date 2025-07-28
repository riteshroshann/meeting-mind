"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileAudio,
  Play,
  Pause,
  Download,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Wifi,
  WifiOff,
  StickyNote,
  FileText,
  Brain,
  Copy,
  Volume2,
} from "lucide-react"
import { Navigation } from "@/components/navigation"

interface ProcessedData {
  transcript: string
  translation: string
  summary: string
  actionItems: Array<{
    item: string
    assignee: string
    priority: string
    dueDate: string
  }>
  keyDecisions: string[]
}

interface ProcessingMetadata {
  sourceLanguage: string
  targetLanguage: string
  audioFormat: string
  fileSize: number
  fileName: string
  preMeetingNotesProvided: boolean
  processingTime: {
    bhashini: number
    gemini: number
    total: number
  }
}

export default function SessionsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState("hi")
  const [targetLanguage, setTargetLanguage] = useState("en")
  const [preMeetingNotes, setPreMeetingNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null)
  const [metadata, setMetadata] = useState<ProcessingMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState("")
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Check network connectivity
  const checkConnectivity = useCallback(async () => {
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        cache: "no-cache",
      })
      setIsOnline(response.ok)
      return response.ok
    } catch {
      setIsOnline(false)
      return false
    }
  }, [])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["audio/wav", "audio/mp3", "audio/mpeg", "audio/flac", "audio/m4a", "audio/ogg"]
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|flac|m4a|ogg)$/i)) {
        setError("Please select a valid audio file (WAV, MP3, FLAC, M4A, or OGG)")
        return
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        setError("File size must be less than 50MB")
        return
      }

      setSelectedFile(file)
      setError(null)
      setProcessedData(null)
      setMetadata(null)
      setRetryCount(0)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        const fakeEvent = {
          target: { files: [file] },
        } as React.ChangeEvent<HTMLInputElement>
        handleFileSelect(fakeEvent)
      }
    },
    [handleFileSelect],
  )

  const simulateProgress = useCallback(() => {
    let currentProgress = 0
    const steps = [
      { progress: 10, step: "Checking connectivity..." },
      { progress: 20, step: "Uploading audio file..." },
      { progress: 35, step: "Authenticating with Bhashini..." },
      { progress: 50, step: "Transcribing speech with Bhashini ASR..." },
      { progress: 65, step: "Translating content with Bhashini..." },
      { progress: 80, step: "Generating AI summary..." },
      { progress: 95, step: "Finalizing results..." },
      { progress: 100, step: "Processing complete!" },
    ]

    const progressInterval = setInterval(() => {
      if (currentProgress < steps.length) {
        setProgress(steps[currentProgress].progress)
        setProcessingStep(steps[currentProgress].step)
        currentProgress++
      } else {
        clearInterval(progressInterval)
      }
    }, 1500)

    return progressInterval
  }, [])

  const processAudio = useCallback(async () => {
    if (!selectedFile) {
      setError("Please select an audio file first")
      return
    }

    // Check connectivity first
    const isConnected = await checkConnectivity()
    if (!isConnected) {
      setError("No internet connection. Please check your network and try again.")
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(0)
    setProcessingStep("Initializing...")

    const progressInterval = simulateProgress()

    try {
      const formData = new FormData()
      formData.append("audio", selectedFile)
      formData.append("sourceLanguage", sourceLanguage)
      formData.append("targetLanguage", targetLanguage)
      if (preMeetingNotes.trim()) {
        formData.append("preMeetingNotes", preMeetingNotes.trim())
      }

      console.log("Sending request to backend...")
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const response = await fetch(`${backendUrl}/api/process-audio/`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      console.log("Response status:", response.status)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.error("Error response:", errorData)
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          const errorText = await response.text()
          console.error("Raw error response:", errorText)
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("Success response:", result)

      // Validate response structure before using it
      if (!result.success) {
        throw new Error(result.error || "Processing failed - backend returned success=false")
      }

      if (!result.data) {
        throw new Error("Invalid response format: missing data field")
      }

      // Safely extract data with fallbacks
      const processedData = {
        transcript: result.data.transcript || "",
        translation: result.data.translation || "",
        summary: result.data.summary || "",
        actionItems: Array.isArray(result.data.actionItems) ? result.data.actionItems : [],
        keyDecisions: Array.isArray(result.data.keyDecisions) ? result.data.keyDecisions : [],
      }

      const metadata = {
        sourceLanguage: result.metadata?.sourceLanguage || sourceLanguage,
        targetLanguage: result.metadata?.targetLanguage || targetLanguage,
        audioFormat: result.metadata?.audioFormat || "unknown",
        fileSize: result.metadata?.fileSize || selectedFile.size,
        fileName: result.metadata?.fileName || selectedFile.name,
        preMeetingNotesProvided: result.metadata?.preMeetingNotesProvided || !!preMeetingNotes.trim(),
        processingTime: {
          bhashini: result.metadata?.processingTime?.bhashini || 0,
          gemini: result.metadata?.processingTime?.gemini || 0,
          total: result.metadata?.processingTime?.total || 0,
        },
      }

      console.log("Processed data:", processedData)
      console.log("Metadata:", metadata)

      setProcessedData(processedData)
      setMetadata(metadata)
      setProgress(100)
      setProcessingStep("Processing complete!")
    } catch (err) {
      clearInterval(progressInterval)
      console.error("Processing error:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      setProgress(0)
      setProcessingStep("")
      // Increment retry count for potential auto-retry logic
      setRetryCount((prev) => prev + 1)
    } finally {
      setIsProcessing(false)
    }
  }, [selectedFile, sourceLanguage, targetLanguage, preMeetingNotes, simulateProgress, checkConnectivity])

  const retryProcessing = useCallback(() => {
    if (retryCount < 3) {
      processAudio()
    } else {
      setError("Maximum retry attempts reached. Please refresh and try again.")
    }
  }, [processAudio, retryCount])

  const toggleAudioPlayback = useCallback(() => {
    if (audioRef.current && selectedFile) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        if (!audioRef.current.src) {
          audioRef.current.src = URL.createObjectURL(selectedFile)
        }
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying, selectedFile])

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }, [])

  const speakText = useCallback((text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang // Use provided language for speech
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const saveSession = useCallback(() => {
    if (processedData && metadata) {
      const sessionData = {
        timestamp: new Date().toISOString(),
        fileName: metadata.fileName,
        processedData,
        metadata,
        preMeetingNotes,
      }
      // Save to localStorage for now
      const sessions = JSON.parse(localStorage.getItem("meetingSessions") || "[]")
      sessions.push(sessionData)
      localStorage.setItem("meetingSessions", JSON.stringify(sessions))

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    }
  }, [processedData, metadata, preMeetingNotes])

  const exportResults = useCallback(
    (format: "txt" | "json") => {
      if (!processedData || !metadata) return

      const timestamp = new Date().toISOString().slice(0, 10)
      const fileName = `meeting-summary-${timestamp}.${format}`

      let content: string

      if (format === "txt") {
        content = `Meeting Summary - ${metadata.fileName}
Generated on: ${new Date().toLocaleString()}

=== PRE-MEETING NOTES ===
${preMeetingNotes || "No pre-meeting notes provided"}

=== RAW TRANSCRIPT (${metadata.sourceLanguage.toUpperCase()}) ===
${processedData.transcript || ""}

=== TRANSLATION (${metadata.targetLanguage.toUpperCase()}) ===
${processedData.translation || ""}

=== AI SUMMARY ===
${processedData.summary || ""}

=== ACTION ITEMS ===
${processedData.actionItems
  .map(
    (item, index) =>
      `${index + 1}. ${item.item}
   Assignee: ${item.assignee}
   Priority: ${item.priority}
   Due Date: ${item.dueDate}`,
  )
  .join("\n\n")}

=== KEY DECISIONS ===
${processedData.keyDecisions.map((decision, index) => `${index + 1}. ${decision}`).join("\n")}

=== PROCESSING METADATA ===
Source Language: ${metadata.sourceLanguage}
Target Language: ${metadata.targetLanguage}
Audio Format: ${metadata.audioFormat}
File Size: ${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB
Processing Time: ${metadata.processingTime.total}s
Bhashini Time: ${metadata.processingTime.bhashini}s
Gemini Time: ${metadata.processingTime.gemini}s`
      } else {
        content = JSON.stringify(
          {
            preMeetingNotes,
            rawTranscript: processedData.transcript,
            translation: processedData.translation,
            aiSummary: processedData.summary,
            actionItems: processedData.actionItems,
            keyDecisions: processedData.keyDecisions,
            metadata,
            exportedAt: new Date().toISOString(),
          },
          null,
          2,
        )
      }

      const blob = new Blob([content], { type: format === "txt" ? "text/plain" : "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [processedData, metadata, preMeetingNotes],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Meeting Assistant</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your meeting recordings into actionable insights with AI-powered transcription, translation, and
            summarization
          </p>
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {isOnline ? (
              <div className="flex items-center gap-2 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Upload Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Upload Audio File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  selectedFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.wav,.mp3,.flac,.m4a,.ogg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-3">
                    <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
                    <div>
                      <p className="font-medium text-green-800 text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-green-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleAudioPlayback()
                        }}
                        className="flex items-center gap-1 text-xs"
                      >
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        {isPlaying ? "Pause" : "Preview"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                          setProcessedData(null)
                          setMetadata(null)
                          setError(null)
                          setRetryCount(0)
                        }}
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FileAudio className="h-10 w-10 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-base font-medium text-gray-700">Drop audio file here</p>
                      <p className="text-xs text-gray-500">or click to browse</p>
                      <p className="text-xs text-gray-400 mt-1">WAV, MP3, FLAC, M4A, OGG (max 50MB)</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source Language</label>
                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isProcessing}
                  >
                    <option value="hi">Hindi</option>
                    <option value="en">English</option>
                    <option value="bn">Bengali</option>
                    <option value="te">Telugu</option>
                    <option value="mr">Marathi</option>
                    <option value="ta">Tamil</option>
                    <option value="gu">Gujarati</option>
                    <option value="kn">Kannada</option>
                    <option value="ml">Malayalam</option>
                    <option value="pa">Punjabi</option>
                    <option value="or">Odia</option>
                    <option value="as">Assamese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isProcessing}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                    <option value="te">Telugu</option>
                    <option value="mr">Marathi</option>
                    <option value="ta">Tamil</option>
                    <option value="gu">Gujarati</option>
                    <option value="kn">Kannada</option>
                    <option value="ml">Malayalam</option>
                    <option value="pa">Punjabi</option>
                    <option value="or">Odia</option>
                    <option value="as">Assamese</option>
                  </select>
                </div>
              </div>

              {/* Pre-meeting Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Pre-meeting Notes (Optional)
                </label>
                <Textarea
                  value={preMeetingNotes}
                  onChange={(e) => setPreMeetingNotes(e.target.value)}
                  placeholder="Add context, agenda items, or background information to help AI generate better summaries..."
                  className="min-h-[80px] resize-none text-sm"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes will be combined with the transcript for AI analysis
                </p>
              </div>

              {/* Raw Transcription Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Raw Transcription
                  {processedData?.transcript && (
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(processedData.transcript, "transcript")}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {copySuccess === "transcript" ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakText(processedData.transcript, sourceLanguage)}
                        className="h-6 px-2 text-xs"
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Listen
                      </Button>
                    </div>
                  )}
                </label>
                <Textarea
                  value={
                    processedData?.transcript ||
                    (isProcessing
                      ? "Processing transcription..."
                      : "Raw transcription will appear here after processing...")
                  }
                  readOnly
                  placeholder="Raw transcription will appear here after processing..."
                  className="min-h-[120px] resize-none text-sm"
                  disabled={isProcessing}
                />
                {metadata && (
                  <p className="text-xs text-gray-500 mt-1">
                    Source Language: {metadata.sourceLanguage.toUpperCase()} • Processing Time:{" "}
                    {metadata.processingTime.bhashini}s
                  </p>
                )}
              </div>

              {/* Translated Text Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Translated Text
                  {processedData?.translation && (
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(processedData.translation, "translation")}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {copySuccess === "translation" ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakText(processedData.translation, targetLanguage)}
                        className="h-6 px-2 text-xs"
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Listen
                      </Button>
                    </div>
                  )}
                </label>
                <Textarea
                  value={
                    processedData?.translation ||
                    (isProcessing ? "Translating content..." : "Translated text will appear here after processing...")
                  }
                  readOnly
                  placeholder="Translated text will appear here after processing..."
                  className="min-h-[120px] resize-none text-sm"
                  disabled={isProcessing}
                />
                {metadata && processedData?.translation && (
                  <p className="text-xs text-gray-500 mt-1">Target Language: {metadata.targetLanguage.toUpperCase()}</p>
                )}
              </div>

              {/* AI Summary Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Summary
                  {processedData?.summary && (
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(processedData.summary, "summary")}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {copySuccess === "summary" ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakText(processedData.summary, "en-US")} // Assuming AI summary is in English
                        className="h-6 px-2 text-xs"
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Listen
                      </Button>
                    </div>
                  )}
                </label>
                <Textarea
                  value={
                    processedData?.summary ||
                    (isProcessing
                      ? "Generating AI summary..."
                      : "AI-generated summary will appear here after processing...")
                  }
                  readOnly
                  placeholder="AI-generated summary will appear here after processing..."
                  className="min-h-[120px] resize-none text-sm"
                  disabled={isProcessing}
                />
                {metadata && processedData?.summary && (
                  <p className="text-xs text-gray-500 mt-1">
                    AI Processing Time: {metadata.processingTime.gemini}s • Total Processing:{" "}
                    {metadata.processingTime.total}s
                  </p>
                )}
              </div>

              {/* Action Items Display */}
              {processedData?.actionItems && processedData.actionItems.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Action Items
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-white text-sm">
                    <ul className="list-disc pl-5 space-y-2">
                      {processedData.actionItems.map((item, index) => (
                        <li key={index}>
                          <strong>{item.item}</strong>
                          {item.assignee && ` (Assignee: ${item.assignee})`}
                          {item.priority && ` (Priority: ${item.priority})`}
                          {item.dueDate && ` (Due: ${item.dueDate})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Key Decisions Display */}
              {processedData?.keyDecisions && processedData.keyDecisions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Key Decisions
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-white text-sm">
                    <ul className="list-disc pl-5 space-y-2">
                      {processedData.keyDecisions.map((decision, index) => (
                        <li key={index}>{decision}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <Button
                onClick={processAudio}
                disabled={!selectedFile || isProcessing || !isOnline}
                className="w-full py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Process Audio
                  </div>
                )}
              </Button>

              {/* Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-gray-600 text-center">{processingStep}</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    {error}
                    {retryCount < 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={retryProcessing}
                        className="ml-2 h-6 px-2 text-xs bg-transparent"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry ({retryCount}/3)
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {processedData && metadata && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button onClick={saveSession} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Save className="h-4 w-4" />
                    {saveSuccess ? "Saved!" : "Save Session"}
                  </Button>
                  <Button onClick={() => exportResults("txt")} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export TXT
                  </Button>
                  <Button onClick={() => exportResults("json")} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export JSON
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedFile(null)
                      setProcessedData(null)
                      setMetadata(null)
                      setError(null)
                      setProgress(0)
                      setProcessingStep("")
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Process New File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden audio element for preview */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  )
}
