"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { FileText, Users, Download, Share, Clock, CheckCircle, AlertCircle, BarChart3, RefreshCw } from "lucide-react"
import { ChartRadarDots } from "@/components/chart-radar-dots"
import { Textarea } from "@/components/ui/textarea"

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

interface ProcessingResultsProps {
  fileName: string
  language: string
  targetLanguage: string
  preMeetingNotes: string
  onNewSession: () => void
  processedData: ProcessedData // New prop for actual processed data
}

export function ProcessingResults({
  fileName,
  language,
  targetLanguage,
  preMeetingNotes,
  onNewSession,
  processedData, // Destructure the new prop
}: ProcessingResultsProps) {
  const [activeTab, setActiveTab] = useState("transcript")

  // Use processedData instead of mockResults
  const { transcript, summary, translatedText, actionItems } = processedData

  // Mock data for duration, speakers, words, confidence, processingTime
  // In a real app, these would also come from the backend API
  const mockStats = {
    duration: "24:35", // Placeholder
    speakers: 3, // Placeholder
    words: transcript.split(/\s+/).filter(Boolean).length, // Calculate from actual transcript
    confidence: 94, // Placeholder
    processingTime: "2m 15s", // Placeholder
  }

  const combinedSummaryAndNotes = `AI-Generated Summary:\n${summary}\n\n${
    preMeetingNotes ? `Pre-Meeting Notes:\n${preMeetingNotes}` : ""
  }\n\n${`Translated Transcript (Target Language: ${targetLanguage}):\n${translatedText}`}`

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
              <CardDescription className="text-white/70">
                {fileName} • Processed in {mockStats.processingTime}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="font-medium text-white">{mockStats.duration}</p>
              <p className="text-xs text-white/70">Duration</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="font-medium text-white">{mockStats.speakers}</p>
              <p className="text-xs text-white/70">Speakers</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <FileText className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="font-medium text-white">{mockStats.words.toLocaleString()}</p>
              <p className="text-xs text-white/70">Words</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <BarChart3 className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="font-medium text-white">{mockStats.confidence}%</p>
              <p className="text-xs text-white/70">Confidence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20">
          <TabsTrigger
            value="transcript"
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=inactive]:text-white/70 data-[state=inactive]:hover:bg-white/5"
          >
            Transcript
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=inactive]:text-white/70 data-[state=inactive]:hover:bg-white/5"
          >
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="speakers"
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=inactive]:text-white/70 data-[state=inactive]:hover:bg-white/5"
          >
            Speakers
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=inactive]:text-white/70 data-[state=inactive]:hover:bg-white/5"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Full Transcript</CardTitle>
              <CardDescription className="text-white/70">
                Timestamped transcript with speaker identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-white">{transcript}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Meeting Summary & Notes</CardTitle>
              <CardDescription className="text-white/70">
                AI-generated summary and your pre-meeting notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={combinedSummaryAndNotes}
                className="bg-white/10 border-white/20 text-white min-h-[250px] whitespace-pre-wrap"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Action Items</CardTitle>
              <CardDescription className="text-white/70">Automatically extracted tasks and follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actionItems.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.item}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-white/70">
                        <span>Assignee: {item.assignee}</span>
                        <Badge variant={item.priority === "High" ? "destructive" : "secondary"}>{item.priority}</Badge>
                        <span>Due: {item.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speakers" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Speaker Analysis</CardTitle>
              <CardDescription className="text-white/70">
                Breakdown of participation and speaking patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mock speaker data for now, as Bhashini ASR doesn't provide speaker diarization directly */}
                {[
                  {
                    id: "Speaker 1",
                    name: "Sarah (Meeting Organizer)",
                    talkTime: "45%",
                    wordCount: 1461,
                    segments: 8,
                  },
                  {
                    id: "Speaker 2",
                    name: "Marketing Representative",
                    talkTime: "32%",
                    wordCount: 1039,
                    segments: 5,
                  },
                  {
                    id: "Speaker 3",
                    name: "Technical Lead",
                    talkTime: "23%",
                    wordCount: 747,
                    segments: 4,
                  },
                ].map((speaker, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{speaker.name}</h4>
                      <Badge variant="outline">{speaker.talkTime} talk time</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
                      <div>
                        <p className="text-muted-foreground">Words spoken</p>
                        <p className="font-medium text-white">{speaker.wordCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Speaking segments</p>
                        <p className="font-medium text-white">{speaker.segments}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Talk time</p>
                        <p className="font-medium text-white">{speaker.talkTime}</p>
                      </div>
                    </div>
                    {index < 2 && <Separator className="mt-4 bg-white/20" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <ChartRadarDots />

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Meeting Insights</CardTitle>
                <CardDescription className="text-white/70">AI-powered analysis of meeting dynamics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Engagement Level</span>
                    <Badge variant="secondary">High</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Meeting Pace</span>
                    <Badge variant="secondary">Balanced</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Topic Focus</span>
                    <Badge variant="secondary">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Action Items</span>
                    <Badge variant="secondary">{actionItems.length} identified</Badge>
                  </div>
                </div>

                <Separator className="bg-white/20" />

                <div>
                  <h4 className="font-medium mb-2 text-white">Key Topics Discussed</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Q3 Performance</Badge>
                    <Badge variant="outline">Revenue Growth</Badge>
                    <Badge variant="outline">Customer Support</Badge>
                    <Badge variant="outline">Technical Infrastructure</Badge>
                    <Badge variant="outline">Marketing Campaigns</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={onNewSession}
          variant="outline"
          className="bg-transparent border-white/30 text-white hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Process Another File
        </Button>
        <Button className="bg-white text-black hover:bg-white/90">
          <Download className="w-4 h-4 mr-2" />
          Download Results
        </Button>
      </div>
    </div>
  )
}
