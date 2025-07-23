"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedBackground } from "@/components/animated-background"
import { Navigation } from "@/components/navigation"

export default function AuthComingSoonPage() {
  return (
    <AnimatedBackground variant="subtle">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
          Coming Soon!
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-xl">
          We're actively working on bringing you secure authentication and a seamless onboarding experience. Stay tuned!
        </p>
        <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </AnimatedBackground>
  )
}
