"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Volume2, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TranslationDisplayProps {
  isProcessing: boolean
  processingStep: string
  translation: string
  transcript: string
  sourceLanguage: string
  targetLanguage: string
  onCopy: (text: string) => void
  copySuccess: boolean
}

export function TranslationDisplay({
  isProcessing,
  processingStep,
  translation,
  transcript,
  sourceLanguage,
  targetLanguage,
  onCopy,
  copySuccess,
}: TranslationDisplayProps) {
  const speakText = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const showSkeleton = isProcessing && (!transcript || !translation)
  const showNoContent = !isProcessing && !transcript && !translation

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-purple-600" />
          Live Translation & Transcription
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showNoContent ? (
          <Alert className="border-gray-200 bg-gray-50 text-gray-700">
            <AlertDescription className="text-sm">
              Upload an audio file and click "Process Audio" to see transcription and translation results here.
            </AlertDescription>
          </Alert>
        ) : showSkeleton ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="translation" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="translation">Translation ({targetLanguage.toUpperCase()})</TabsTrigger>
              <TabsTrigger value="transcript">Transcript ({sourceLanguage.toUpperCase()})</TabsTrigger>
            </TabsList>
            <TabsContent value="translation" className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Translated Content</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onCopy(translation)} className="h-6 px-2 text-xs">
                    <Copy className="h-3 w-3 mr-1" />
                    {copySuccess ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakText(translation, targetLanguage)}
                    className="h-6 px-2 text-xs"
                  >
                    <Volume2 className="h-3 w-3 mr-1" />
                    Listen
                  </Button>
                </div>
              </div>
              <Textarea
                value={translation}
                readOnly
                className="min-h-[150px] resize-none text-sm bg-purple-50/50 border-purple-200"
                placeholder="Translated content will appear here..."
              />
            </TabsContent>
            <TabsContent value="transcript" className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Original Transcript</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onCopy(transcript)} className="h-6 px-2 text-xs">
                    <Copy className="h-3 w-3 mr-1" />
                    {copySuccess ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakText(transcript, sourceLanguage)}
                    className="h-6 px-2 text-xs"
                  >
                    <Volume2 className="h-3 w-3 mr-1" />
                    Listen
                  </Button>
                </div>
              </div>
              <Textarea
                value={transcript}
                readOnly
                className="min-h-[150px] resize-none text-sm bg-blue-50/50 border-blue-200"
                placeholder="Original transcription will appear here..."
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
