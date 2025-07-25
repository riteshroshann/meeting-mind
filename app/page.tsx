import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Mic, BarChart3, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { FeatureShowcase } from "@/components/feature-showcase"

export default function HomePage() {
  return (
    <AnimatedBackground>
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 relative">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered Meeting Intelligence
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Transform Audio into
            <br />
            Actionable Insights
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Upload your meeting recordings and get AI-powered transcriptions, summaries, and action items in multiple
            languages with enterprise-grade security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 bg-white text-black hover:bg-white/90">
              <Link href="/sessions">
                Start Processing Audio
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-transparent border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/coming-soon">View All Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Powerful AI Features</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Everything you need to turn your audio recordings into structured, actionable meeting documentation.
          </p>
        </div>

        <FeatureShowcase />
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">How It Works</h2>
          <p className="text-white/70">Simple, fast, and secure audio processing in three steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">1. Upload Audio</h3>
            <p className="text-white/70">Drag and drop your meeting recording or select from your device</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">2. AI Processing</h3>
            <p className="text-white/70">Our AI transcribes, identifies speakers, and generates summaries</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">3. Get Insights</h3>
            <p className="text-white/70">Review, edit, and share your structured meeting documentation</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Meetings?</h2>
            <p className="text-xl mb-8 text-white/80">
              Start processing your audio recordings with AI-powered intelligence today.
            </p>
            <Button size="lg" className="text-lg px-8 bg-white text-black hover:bg-white/90" asChild>
              <Link href="/sessions">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-white" />
              <span className="font-bold text-lg text-white">MeetingMind</span>
            </div>
            <p className="text-white/60 text-sm">© 2024 MeetingMind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </AnimatedBackground>
  )
}
