"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileAudio, X, Play, Pause, Languages, Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import ProcessingResults from "./processing-results"
import LiveTranslationDisplay from "./live-translation-display"

const SUPPORTED_LANGUAGES = [
  { code: "hi", name: "Hindi" },
  { code: "en", name: "English" },
  { code: "bn", name: "Bengali" },
  { code: "te", name: "Telugu" },
  { code: "mr", name: "Marathi" },
  { code: "ta", name: "Tamil" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "pa", name: "Punjabi" },
  { code: "or", name: "Odia" },
  { code: "as", name: "Assamese" },
  { code: "ur", name: "Urdu" },
]

const SUPPORTED_FORMATS = ["wav", "mp3", "flac", "m4a", "ogg"]

interface ProcessingState {
  stage: "idle" | "uploading" | "transcribing" | "translating" | "analyzing" | "complete" | "error"
  progress: number
  message: string
}

export default function AudioUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState("hi")
  const [targetLanguage, setTargetLanguage] = useState("en")
  const [preMeetingNotes, setPreMeetingNotes] = useState("")
  const [processingState, setProcessingState] = useState<ProcessingState>({
    stage: "idle",
    progress: 0,
    message: "",
  })
  const [results, setResults] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Live display states
  const [liveTranslation, setLiveTranslation] = useState("")
  const [liveSummary, setLiveSummary] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()
    if (!fileExtension || !SUPPORTED_FORMATS.includes(fileExtension)) {
      toast({
        title: "Unsupported file format",
        description: `Please select a file with one of these formats: ${SUPPORTED_FORMATS.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setResults(null) // Clear previous results
    setLiveTranslation("") // Clear live translation
    setLiveSummary("") // Clear live summary
    toast({
      title: "File selected",
      description: `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`,
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = () => {
    setFile(null)
    setResults(null)
    setLiveTranslation("")
    setLiveSummary("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !file) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const simulateProgress = (targetProgress: number, duration: number) => {
    const startProgress = processingState.progress
    const progressDiff = targetProgress - startProgress
    const steps = 50
    const stepSize = progressDiff / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const newProgress = startProgress + stepSize * currentStep

      setProcessingState((prev) => ({
        ...prev,
        progress: Math.min(newProgress, targetProgress),
      }))

      if (currentStep >= steps) {
        clearInterval(interval)
      }
    }, stepDuration)

    return interval
  }

  const processAudio = async () => {
    if (!file) return

    try {
      // Reset state
      setResults(null)
      setLiveTranslation("")
      setLiveSummary("")
      setProcessingState({
        stage: "uploading",
        progress: 0,
        message: "Preparing audio file...",
      })

      // Simulate upload progress
      const uploadInterval = simulateProgress(20, 1000)

      // Prepare form data
      const formData = new FormData()
      formData.append("audio", file)
      formData.append("sourceLanguage", sourceLanguage)
      formData.append("targetLanguage", targetLanguage)
      formData.append("preMeetingNotes", preMeetingNotes)

      // Clear upload simulation
      setTimeout(() => clearInterval(uploadInterval), 1000)

      // Start transcription phase
      setTimeout(() => {
        setProcessingState({
          stage: "transcribing",
          progress: 25,
          message: "Converting speech to text...",
        })
        simulateProgress(50, 3000)
      }, 1200)

      // Start translation phase with live updates
      setTimeout(() => {
        setProcessingState({
          stage: "translating",
          progress: 55,
          message: "Translating content...",
        })
        simulateProgress(75, 2000)

        // Simulate live translation updates
        setTimeout(() => setLiveTranslation("Processing translation..."), 500)
      }, 4500)

      // Start AI analysis phase with live updates
      setTimeout(() => {
        setProcessingState({
          stage: "analyzing",
          progress: 80,
          message: "Generating AI insights...",
        })
        simulateProgress(95, 2000)

        // Simulate live summary updates
        setTimeout(() => setLiveSummary("Analyzing meeting content..."), 500)
      }, 6800)

      // Make the actual API call
      const response = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Processing failed")
      }

      // Update live displays with actual results
      setLiveTranslation(result.data?.translation || "Translation completed")
      setLiveSummary(result.data?.summary || "Summary completed")

      // Complete processing
      setProcessingState({
        stage: "complete",
        progress: 100,
        message: "Processing complete!",
      })

      setResults(result)

      toast({
        title: "Processing complete!",
        description: "Your meeting has been analyzed successfully.",
      })
    } catch (error) {
      console.error("Processing error:", error)
      setProcessingState({
        stage: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })

      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const getStageIcon = () => {
    switch (processingState.stage) {
      case "uploading":
        return <Upload className="w-4 h-4" />
      case "transcribing":
        return <FileAudio className="w-4 h-4" />
      case "translating":
        return <Languages className="w-4 h-4" />
      case "analyzing":
        return <Brain className="w-4 h-4" />
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const isProcessing = ["uploading", "transcribing", "translating", "analyzing"].includes(processingState.stage)
  const showLiveDisplay = file && (isProcessing || liveTranslation || liveSummary)

  // Show results if processing is complete
  if (processingState.stage === "complete" && results?.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Processing Complete</h2>
          <Button
            variant="outline"
            onClick={() => {
              setProcessingState({ stage: "idle", progress: 0, message: "" })
              setResults(null)
              setFile(null)
              setLiveTranslation("")
              setLiveSummary("")
            }}
          >
            Process Another File
          </Button>
        </div>
        <ProcessingResults data={results.data} metadata={results.metadata} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="w-5 h-5" />
            Upload Audio File
          </CardTitle>
          <CardDescription>
            Select an audio file to transcribe, translate, and analyze. Supported formats:{" "}
            {SUPPORTED_FORMATS.join(", ")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-2">Drop your audio file here, or click to browse</p>
              <p className="text-sm text-gray-500">Maximum file size: 50MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_FORMATS.map((f) => `.${f}`).join(",")}
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileAudio className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={togglePlayback} disabled={isProcessing}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={removeFile} disabled={isProcessing}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <audio
                ref={audioRef}
                src={file ? URL.createObjectURL(file) : undefined}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Language Settings
          </CardTitle>
          <CardDescription>Select the source and target languages for transcription and translation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-language">Source Language (Audio)</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-language">Target Language (Translation)</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-meeting Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Pre-meeting Context (Optional)
          </CardTitle>
          <CardDescription>Add any context, agenda, or notes to help improve the AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter any pre-meeting notes, agenda items, or context that might help with the analysis..."
            value={preMeetingNotes}
            onChange={(e) => setPreMeetingNotes(e.target.value)}
            rows={4}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {/* Live Translation and Summary Display */}
      {showLiveDisplay && (
        <LiveTranslationDisplay
          translationText={liveTranslation}
          summaryText={liveSummary}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          isProcessing={isProcessing}
        />
      )}

      {/* Processing Status */}
      {processingState.stage !== "idle" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStageIcon()}
              Processing Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{processingState.message}</span>
              <span className="text-sm text-gray-500">{processingState.progress}%</span>
            </div>
            <Progress value={processingState.progress} className="w-full" />

            {processingState.stage === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{processingState.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Process Button */}
      <div className="flex justify-center">
        <Button onClick={processAudio} disabled={!file || isProcessing} size="lg" className="px-8">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Analyze Meeting
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
