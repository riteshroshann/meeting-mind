"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Description, Field, Label, Textarea } from "@headlessui/react"
import { Mic, Languages, Copy, Volume2, VolumeX } from "lucide-react"
import clsx from "clsx"

interface LiveTranslationDisplayProps {
  isProcessing: boolean
  processingStep: string
  translation: string
  transcript: string
  sourceLanguage: string
  targetLanguage: string
  wordCount: number
  onCopy: (text: string) => void
  copySuccess: boolean
}

export function LiveTranslationDisplay({
  isProcessing,
  processingStep,
  translation,
  transcript,
  sourceLanguage,
  targetLanguage,
  wordCount,
  onCopy,
  copySuccess,
}: LiveTranslationDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    if (!translation) return

    speechSynthRef.current = new SpeechSynthesisUtterance(translation)
    speechSynthRef.current.lang = targetLanguage === "en" ? "en-US" : targetLanguage
    speechSynthRef.current.onend = () => setIsSpeaking(false)
    speechSynthRef.current.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(speechSynthRef.current)
    setIsSpeaking(true)
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
      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900">Live Translation</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {sourceLanguage.toUpperCase()} → {targetLanguage.toUpperCase()}
              </Badge>
              {wordCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  {wordCount} words
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="animate-pulse flex space-x-2 justify-center mb-2">
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div
                    className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-blue-700">
                  {processingStep.includes("Transcribing") || processingStep.includes("Translating")
                    ? processingStep
                    : "Waiting for translation..."}
                </p>
              </div>
              <Skeleton className="h-4 w-full bg-blue-100" />
              <Skeleton className="h-4 w-3/4 bg-blue-100" />
              <Skeleton className="h-4 w-5/6 bg-blue-100" />
              <Skeleton className="h-4 w-2/3 bg-blue-100" />
            </div>
          ) : translation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(translation)}
                  className="flex items-center gap-1 h-7 px-2 text-xs bg-white/80 border-blue-200 hover:bg-blue-50"
                >
                  <Copy className="h-3 w-3" />
                  {copySuccess ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTextToSpeech}
                  className="flex items-center gap-1 h-7 px-2 text-xs bg-white/80 border-blue-200 hover:bg-blue-50"
                  disabled={!translation}
                >
                  {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  {isSpeaking ? "Stop" : "Listen"}
                </Button>
              </div>

              <Field>
                <Label className="text-sm/6 font-medium text-blue-900">Translated Content</Label>
                <Description className="text-sm/6 text-blue-700/70">
                  Real-time translation from {sourceLanguage.toUpperCase()} to {targetLanguage.toUpperCase()}
                </Description>
                <Textarea
                  value={translation}
                  readOnly
                  className={clsx(
                    "mt-3 block w-full resize-none rounded-lg border-none bg-white/60 px-4 py-3 text-sm/6 text-blue-900",
                    "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-blue-500/25",
                    "backdrop-blur-sm shadow-inner",
                  )}
                  rows={8}
                />
              </Field>

              {transcript && transcript !== translation && (
                <Field>
                  <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Mic className="h-3 w-3" />
                    Original Transcript ({sourceLanguage.toUpperCase()})
                  </Label>
                  <Description className="text-xs/5 text-gray-500/70">Raw transcription before translation</Description>
                  <Textarea
                    value={transcript}
                    readOnly
                    className={clsx(
                      "mt-2 block w-full resize-none rounded-lg border-none bg-gray-50/80 px-3 py-2 text-xs/5 text-gray-600",
                      "focus:not-data-focus:outline-none",
                      "border border-gray-100 shadow-inner",
                    )}
                    rows={4}
                  />
                </Field>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Languages className="h-8 w-8 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Live translation will appear here</p>
              <p className="text-xs text-gray-400 mt-1">Upload and process an audio file to begin</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
