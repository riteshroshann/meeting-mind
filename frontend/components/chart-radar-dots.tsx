"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { metric: "Clarity", score: 94 },
  { metric: "Engagement", score: 87 },
  { metric: "Structure", score: 91 },
  { metric: "Action Items", score: 85 },
  { metric: "Participation", score: 89 },
  { metric: "Focus", score: 92 },
]

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartRadarDots() {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="items-center">
        <CardTitle className="text-white">Meeting Quality Analysis</CardTitle>
        <CardDescription className="text-white/70">
          AI assessment of meeting effectiveness across key metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="metric" className="text-white" />
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium text-white">
          Overall meeting quality: Excellent <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-white/70 flex items-center gap-2 leading-none">Average score: 89.7/100</div>
      </CardFooter>
    </Card>
  )
}
