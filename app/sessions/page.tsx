"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileAudio,
  Languages,
  Brain,
  CheckCircle,
  Clock,
  Users,
  FileText,
  LayoutDashboard,
  ArrowRight,
  Mic,
  StopCircle,
  Play,
  X,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { AudioUpload } from "@/components/audio-upload"
import { ProcessingResults } from "@/components/processing-results"
import { toast } from "sonner"
import { AnimatedBackground } from "@/components/animated-background"
import Link from "next/link"

type ProcessingStage = "upload" | "processing" | "completed"

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

// Helper function to convert AudioBuffer to WAV Blob (16-bit PCM)
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels
  const ambuf = buffer.getChannelData(0)
  const len = ambuf.length
  const result = new Float32Array(len)
  const view = new DataView(new ArrayBuffer(len * 2 + 44))
  const sampleRate = buffer.sampleRate
  let offset = 0

  // Write WAV header
  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
    offset += str.length
  }

  function writeUint32(val: number) {
    view.setUint32(offset, val, true)
    offset += 4
  }

  function writeUint16(val: number) {
    view.setUint16(offset, val, true)
    offset += 2
  }

  writeString("RIFF") // ChunkID
  writeUint32(36 + len * 2) // ChunkSize
  writeString("WAVE") // Format
  writeString("fmt ") // Subchunk1ID
  writeUint32(16) // Subchunk1Size (PCM)
  writeUint16(1) // AudioFormat (PCM)
  writeUint16(numOfChan) // NumChannels
  writeUint32(sampleRate) // SampleRate
  writeUint32(sampleRate * numOfChan * 2) // ByteRate
  writeUint16(numOfChan * 2) // BlockAlign
  writeUint16(16) // BitsPerSample
  writeString("data") // Subchunk2ID
  writeUint32(len * 2) // Subchunk2Size

  // Write audio data (16-bit PCM)
  for (let i = 0; i < len; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, ambuf[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  return new Blob([view.buffer], { type: "audio/wav" })
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://backened-baby-one.onrender.com"

export default function SessionsPage() {
  const [stage, setStage] = useState<ProcessingStage>("upload")
  const [selectedPrimaryLanguage, setSelectedPrimaryLanguage] = useState("hi-IN") // Default to Hindi (India)
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState("en-US") // Default to English (US)
  const [preMeetingNotes, setPreMeetingNotes] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null) // State to store processed data

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const indianLanguages = [
    { value: "en-IN", label: "English (India)" },
    { value: "hi-IN", label: "Hindi (India)" },
    { value: "bn-IN", label: "Bengali (India)" },
    { value: "gu-IN", label: "Gujarati (India)" },
    { value: "kn-IN", label: "Kannada (India)" },
    { value: "ml-IN", label: "Malayalam (India)" },
    { value: "mr-IN", label: "Marathi (India)" },
    { value: "pa-IN", label: "Punjabi (India)" },
    { value: "ta-IN", label: "Tamil (India)" },
    { value: "te-IN", label: "Telugu (India)" },
  ]

  const targetLanguageOptions = [
    { value: "en-US", label: "English (US)", disabled: false },
    ...indianLanguages.map((lang) => ({
      ...lang,
      label: lang.value === "en-IN" ? lang.label : `${lang.label} (Coming Soon)`,
      disabled: lang.value !== "en-IN",
    })),
  ]

  // Function to convert any audio Blob to 16kHz mono 16-bit WAV
  const convertAudioToWav = useCallback(async (audioBlob: Blob): Promise<Blob> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const arrayBuffer = await audioBlob.arrayBuffer()
    const decodedAudio = await audioContext.decodeAudioData(arrayBuffer)

    // Create an OfflineAudioContext for resampling and channel conversion
    const offlineContext = new OfflineAudioContext(1, decodedAudio.duration * 16000, 16000)
    const source = offlineContext.createBufferSource()
    source.buffer = decodedAudio
    source.connect(offlineContext.destination)
    source.start(0)

    const renderedBuffer = await offlineContext.startRendering()
    return audioBufferToWav(renderedBuffer)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      // Clear any previously uploaded file
      setUploadedFile(null)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" }) // Use webm for broad browser support
      audioChunksRef.current = []
      setRecordedAudioBlob(null)
      setRecordingDuration(0)

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const rawAudioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        toast.info("Converting audio to WAV format...")
        try {
          const wavBlob = await convertAudioToWav(rawAudioBlob)
          setRecordedAudioBlob(wavBlob)
          toast.success("Audio converted successfully!")
        } catch (error) {
          toast.error("Failed to convert audio.")
          console.error("Audio conversion error:", error)
        }
        stream.getTracks().forEach((track) => track.stop()) // Stop microphone access
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast.info("Recording started...")

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      toast.error("Failed to start recording. Please ensure microphone access is granted.")
      console.error("Error accessing microphone:", err)
    }
  }, [convertAudioToWav])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      toast.info("Recording stopped. Processing audio...")
    }
  }, [])

  const playRecordedAudio = useCallback(() => {
    if (recordedAudioBlob) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = URL.createObjectURL(recordedAudioBlob)
        audioPlayerRef.current.play()
        toast.info("Playing recorded audio...")
      }
    } else {
      toast.error("No audio recorded yet.")
    }
  }, [recordedAudioBlob])

  const removeRecordedAudio = useCallback(() => {
    setRecordedAudioBlob(null)
    setRecordingDuration(0)
    toast.info("Recorded audio removed.")
  }, [])

  const handleFileUpload = useCallback(
    async (file: File) => {
      // Clear any previously recorded audio
      setRecordedAudioBlob(null)
      setRecordingDuration(0)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
        }
      }

      toast.info("Converting uploaded file to WAV format...")
      try {
        const wavBlob = await convertAudioToWav(file)
        // Create a new File object with the correct name and type
        const wavFile = new File([wavBlob], file.name.replace(/\.[^/.]+$/, "") + ".wav", { type: "audio/wav" })
        setUploadedFile(wavFile)
        toast.success(`File "${wavFile.name}" uploaded and converted successfully!`)
      } catch (error) {
        toast.error("Failed to convert uploaded file.")
        console.error("File conversion error:", error)
        setUploadedFile(null)
      }
    },
    [convertAudioToWav],
  )

  const removeUploadedFile = useCallback(() => {
    setUploadedFile(null)
    toast.info("Uploaded file removed.")
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleProcessing = async () => {
    const audioSource = recordedAudioBlob || uploadedFile

    if (!audioSource) {
      toast.error("Please record or upload an audio file first")
      return
    }

    setStage("processing")
    setProcessingProgress(0) // Reset progress

    const progressSteps = [
      { progress: 20, message: "Uploading audio file..." },
      { progress: 40, message: "Analyzing audio quality..." },
      { progress: 60, message: "Transcribing speech..." },
      { progress: 80, message: "Identifying speakers..." },
      { progress: 95, message: "Generating AI summary..." },
      { progress: 100, message: "Processing complete!" },
    ]

    let currentProgressIndex = 0
    const progressInterval = setInterval(() => {
      if (currentProgressIndex < progressSteps.length - 1) {
        setProcessingProgress(progressSteps[currentProgressIndex].progress)
        toast.info(progressSteps[currentProgressIndex].message)
        currentProgressIndex++
      } else {
        clearInterval(progressInterval)
      }
    }, 1500)

    try {
      const formData = new FormData()
      formData.append("audio", audioSource, audioSource.name || "audio.wav")
      formData.append("primaryLanguage", selectedPrimaryLanguage)
      formData.append("targetLanguage", selectedTargetLanguage)
      formData.append("preMeetingNotes", preMeetingNotes)

      console.log(`Sending request to: ${BACKEND_URL}/api/process-audio/`)

      const response = await fetch(`${BACKEND_URL}/api/process-audio/`, {
        method: "POST",
        body: formData,
        mode: "cors",
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      })

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data: ProcessedData = await response.json()
      setProcessedData(data)

      clearInterval(progressInterval)
      setProcessingProgress(100)
      toast.success("Audio processing completed successfully!")
      setStage("completed")
    } catch (error: any) {
      clearInterval(progressInterval)
      setProcessingProgress(0)
      setStage("upload")

      let errorMessage = "Processing failed"
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage = "Unable to connect to backend server. Please check if the backend is running."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      console.error("Error during processing:", error)
    }
  }

  const resetSession = () => {
    setStage("upload")
    setRecordedAudioBlob(null)
    setUploadedFile(null)
    setProcessingProgress(0)
    setPreMeetingNotes("")
    setSelectedPrimaryLanguage("hi-IN")
    setSelectedTargetLanguage("en-US")
    setProcessedData(null)
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = ""
    }
    // Ensure recording is stopped if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }

  return (
    <AnimatedBackground variant="subtle">
      <Navigation />

      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Audio Processing Session</h1>
            <p className="text-white/70">Transform your audio into actionable insights</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div
              className={`flex items-center space-x-2 ${stage === "upload" ? "text-white" : stage === "processing" || stage === "completed" ? "text-green-400" : "text-white/70"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${stage === "upload" ? "bg-white/20 text-white" : stage === "processing" || stage === "completed" ? "bg-green-400 text-white" : "bg-white/20"}`}
              >
                {stage === "processing" || stage === "completed" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </div>
              <span className="font-medium text-white">Upload</span>
            </div>

            <div
              className={`w-8 h-0.5 ${stage === "processing" || stage === "completed" ? "bg-green-400" : "bg-white/20"}`}
            />

            <div
              className={`flex items-center space-x-2 ${stage === "processing" ? "text-white" : stage === "completed" ? "text-green-400" : "text-white/70"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${stage === "processing" ? "bg-white/20 text-white" : stage === "completed" ? "bg-green-400 text-white" : "bg-white/20"}`}
              >
                {stage === "completed" ? <CheckCircle className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              </div>
              <span className="font-medium text-white">Process</span>
            </div>

            <div className={`w-8 h-0.5 ${stage === "completed" ? "bg-green-400" : "bg-white/20"}`} />

            <div
              className={`flex items-center space-x-2 ${stage === "completed" ? "text-green-400" : "text-white/70"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${stage === "completed" ? "bg-green-400 text-white" : "bg-white/20"}`}
              >
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-medium text-white">Results</span>
            </div>
          </div>

          {/* Upload Stage */}
          {stage === "upload" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Record Audio Card */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Mic className="w-5 h-5" />
                      <span>Record Audio</span>
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Capture live audio from your microphone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!recordedAudioBlob ? (
                      <div className="flex flex-col items-center space-y-4 p-8 text-center">
                        {isRecording ? (
                          <>
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                              <Mic className="w-8 h-8 text-red-400" />
                            </div>
                            <p className="text-lg font-medium text-white">
                              Recording... {formatDuration(recordingDuration)}
                            </p>
                            <Button
                              onClick={stopRecording}
                              size="lg"
                              className="bg-red-600 text-white hover:bg-red-700"
                              disabled={uploadedFile !== null} // Disable if a file is uploaded
                            >
                              <StopCircle className="w-4 h-4 mr-2" />
                              Stop Recording
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                              <Mic className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-lg font-medium text-white">Click to start recording</p>
                            <Button
                              onClick={startRecording}
                              size="lg"
                              className="bg-white text-black hover:bg-white/90"
                              disabled={uploadedFile !== null} // Disable if a file is uploaded
                            >
                              <Mic className="w-4 h-4 mr-2" />
                              Start Recording
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-green-500/30 rounded-lg p-6 bg-green-500/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileAudio className="w-8 h-8 text-green-400" />
                            <div>
                              <p className="font-medium text-white">Recorded Audio</p>
                              <p className="text-sm text-white/70">{formatFileSize(recordedAudioBlob.size)} • WAV</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={playRecordedAudio}
                              className="text-white/70 hover:text-white"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={removeRecordedAudio}
                              className="text-white/70 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <audio ref={audioPlayerRef} className="hidden" controls />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upload Audio Card */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Upload className="w-5 h-5" />
                      <span>Upload Audio File</span>
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Upload pre-recorded meetings (MP3, WAV, M4A, etc.).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AudioUpload onFileUpload={handleFileUpload} disabled={isRecording || recordedAudioBlob !== null} />
                    {uploadedFile && (
                      <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileAudio className="w-8 h-8 text-green-400" />
                            <div>
                              <p className="font-medium text-white">{uploadedFile.name}</p>
                              <p className="text-sm text-white/70">
                                {formatFileSize(uploadedFile.size)} • {uploadedFile.type}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeUploadedFile}
                            className="text-white/70 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Languages className="w-5 h-5" />
                    <span>Language Settings</span>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Configure language and notes for better accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primary-language-select" className="text-white">
                      Primary Language
                    </Label>
                    <Select value={selectedPrimaryLanguage} onValueChange={setSelectedPrimaryLanguage}>
                      <SelectTrigger id="primary-language-select" className="bg-white border-white text-black">
                        <SelectValue placeholder="Select primary language" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        {indianLanguages.map((lang) => (
                          <SelectItem
                            key={lang.value}
                            value={lang.value}
                            className="text-black data-[state=checked]:bg-gray-200 data-[state=checked]:text-black data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
                          >
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="target-language-select" className="text-white">
                      Target Language
                    </Label>
                    <Select value={selectedTargetLanguage} onValueChange={setSelectedTargetLanguage}>
                      <SelectTrigger id="target-language-select" className="bg-white border-white text-black">
                        <SelectValue placeholder="Select target language" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        {targetLanguageOptions.map((lang) => (
                          <SelectItem
                            key={lang.value}
                            value={lang.value}
                            disabled={lang.disabled}
                            className="text-black data-[state=checked]:bg-gray-200 data-[state=checked]:text-black data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                          >
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pre-meeting-notes" className="text-white">
                      Pre-Meeting Notes (Optional)
                    </Label>
                    <Textarea
                      id="pre-meeting-notes"
                      placeholder="Add any notes or context for the meeting here..."
                      value={preMeetingNotes}
                      onChange={(e) => setPreMeetingNotes(e.target.value)}
                      className="mt-2 bg-white/10 border-white/20 text-white"
                    />
                    <p className="text-sm text-white/70 mt-1">
                      These notes can help the AI understand context and improve summary quality.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleProcessing}
                disabled={(!recordedAudioBlob && !uploadedFile) || isRecording}
                size="lg"
                className="w-full bg-white text-black hover:bg-white hover:text-black"
              >
                <Brain className="w-4 h-4 mr-2" />
                Start AI Processing
              </Button>
            </div>
          )}

          {/* Processing Stage */}
          {stage === "processing" && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Processing Audio</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Our AI is analyzing your audio file. This may take a few minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2 text-white">
                    <span>Progress</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="w-full bg-white/20" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <FileAudio className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium text-white">Audio Analysis</p>
                    <p className="text-sm text-white/70">Quality check & preprocessing</p>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium text-white">Speaker Detection</p>
                    <p className="text-sm text-white/70">Identifying unique voices</p>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium text-white">AI Summary</p>
                    <p className="text-sm text-white/70">Generating insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Stage */}
          {stage === "completed" && processedData && (
            <div className="space-y-6">
              <ProcessingResults
                fileName={recordedAudioBlob?.name || uploadedFile?.name || "processed-audio"}
                language={selectedPrimaryLanguage}
                targetLanguage={selectedTargetLanguage}
                preMeetingNotes={preMeetingNotes}
                onNewSession={resetSession}
                processedData={processedData}
              />

              {/* Dashboard Coming Soon Card */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <LayoutDashboard className="w-10 h-10 mx-auto mb-4 text-primary" />
                  <h2 className="text-2xl font-bold mb-2">Dashboard Coming Soon!</h2>
                  <p className="text-white/70 mb-6">
                    A personalized dashboard to manage all your meetings and insights is in the works.
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-white/30 text-white hover:bg-white/10"
                    asChild
                  >
                    <Link href="/coming-soon">
                      Learn More
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AnimatedBackground>
  )
}
