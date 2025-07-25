"use client"

import { useEffect, useRef } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, FileAudio, Languages, Zap, Shield, Users } from "lucide-react"
import gsap from "gsap"

const features = [
  {
    icon: FileAudio,
    title: "Multi-Format Audio Support",
    description: "Upload MP3, WAV, M4A, and other popular audio formats for instant processing",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Languages,
    title: "Multi-Language Processing",
    description: "Support for 50+ languages with personalized language settings and custom vocabulary",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Brain,
    title: "AI-Powered Summaries",
    description: "Get intelligent summaries, action items, and key insights extracted automatically",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption and SOC 2 compliance for your sensitive meeting data",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Speaker Identification",
    description: "Automatic speaker detection and labeling with easy correction tools",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Lightning-fast AI processing with real-time progress updates and notifications",
    color: "from-yellow-500 to-orange-500",
  },
]

export function FeatureShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const cards = cardsRef.current
    if (!cards.length) return

    // Initial animation
    gsap.fromTo(
      cards,
      {
        y: 100,
        opacity: 0,
        scale: 0.8,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
      },
    )

    // Hover animations
    cards.forEach((card) => {
      if (!card) return

      const handleMouseEnter = () => {
        gsap.to(card, {
          scale: 1.05,
          y: -10,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      const handleMouseLeave = () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      card.addEventListener("mouseenter", handleMouseEnter)
      card.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        card.removeEventListener("mouseenter", handleMouseEnter)
        card.removeEventListener("mouseleave", handleMouseLeave)
      }
    })
  }, [])

  return (
    <div ref={containerRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card
          key={index}
          ref={(el) => {
            if (el) cardsRef.current[index] = el
          }}
          className="relative overflow-hidden border-2 border-white/10 bg-black/20 backdrop-blur-sm hover:border-white/20 transition-colors group"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`}
          />
          <CardHeader className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-20`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                AI-Powered
              </Badge>
            </div>
            <CardTitle className="text-white group-hover:text-white/90 transition-colors">{feature.title}</CardTitle>
            <CardDescription className="text-white/70 group-hover:text-white/80 transition-colors">
              {feature.description}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
