import { AnimatedBackground } from "@/components/animated-background"
import { FeatureShowcase } from "@/components/feature-showcase"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Mic, Languages, Brain, FileText, Users, Shield, Zap, ArrowRight, CheckCircle, Globe } from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: Mic,
      title: "Audio Processing",
      description: "Upload meeting recordings in multiple formats (WAV, MP3, FLAC, M4A, OGG)",
      color: "text-blue-600",
    },
    {
      icon: Languages,
      title: "Multi-language Support",
      description: "Transcribe and translate between 12+ Indian and international languages",
      color: "text-green-600",
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Generate comprehensive summaries, action items, and key decisions",
      color: "text-purple-600",
    },
    {
      icon: FileText,
      title: "Export Options",
      description: "Download results in TXT, JSON, or PDF formats for easy sharing",
      color: "text-orange-600",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share meeting insights with team members and stakeholders",
      color: "text-indigo-600",
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Enterprise-grade security for your sensitive meeting data",
      color: "text-red-600",
    },
  ]

  const stats = [
    { label: "Languages Supported", value: "12+", icon: Globe },
    { label: "Processing Speed", value: "< 2min", icon: Zap },
    { label: "Accuracy Rate", value: "95%+", icon: CheckCircle },
    { label: "Users Served", value: "10K+", icon: Users },
  ]

  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navigation />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            <span className="text-gradient-blue-purple">Transform Your Meetings</span> with AI-Powered Insights
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Effortlessly transcribe, translate, and summarize your audio recordings to unlock key decisions and action
            items.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Link href="/sessions">Start a New Session</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="px-8 py-3 text-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-md bg-transparent"
            >
              <Link href="/coming-soon">Learn More</Link>
            </Button>
          </div>
        </div>
      </main>
      <FeatureShowcase />

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Modern Teams</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to transform your meeting recordings into structured, actionable insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="card-hover bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50 backdrop-blur-sm rounded-3xl mx-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple three-step process to get comprehensive meeting insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Audio</h3>
            <p className="text-gray-600">
              Upload your meeting recording in any supported format. Add optional pre-meeting notes for better context.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Processing</h3>
            <p className="text-gray-600">
              Our AI transcribes, translates, and analyzes your meeting content using advanced language models.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Insights</h3>
            <p className="text-gray-600">
              Receive comprehensive summaries, action items, key decisions, and exportable reports.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Transform Your Meetings?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of teams already using AI Meeting Assistant to make their meetings more productive.
          </p>
          <Link href="/sessions">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
      <footer className="py-8 text-center text-gray-500 text-sm relative z-10">
        © 2024 AI Meeting Assistant. All rights reserved.
      </footer>
    </div>
  )
}
