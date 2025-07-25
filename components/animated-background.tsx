"use client"

import type React from "react"

import DarkVeil from "./dark-veil"

interface AnimatedBackgroundProps {
  children: React.ReactNode
  variant?: "default" | "intense" | "subtle"
  className?: string
}

export function AnimatedBackground({ children, variant = "default", className = "" }: AnimatedBackgroundProps) {
  const getVariantProps = () => {
    switch (variant) {
      case "intense":
        return {
          hueShift: 45,
          noiseIntensity: 0.05,
          scanlineIntensity: 0.2,
          speed: 1.2,
          warpAmount: 0.5,
        }
      case "subtle":
        return {
          hueShift: 0,
          noiseIntensity: 0.01,
          scanlineIntensity: 0.05,
          speed: 0.3,
          warpAmount: 0.1,
        }
      default:
        return {
          hueShift: 15,
          noiseIntensity: 0.02,
          scanlineIntensity: 0.1,
          speed: 0.5,
          warpAmount: 0.3,
        }
    }
  }

  return (
    <div className={`relative min-h-screen ${className}`}>
      <div className="fixed inset-0 z-0">
        <DarkVeil {...getVariantProps()} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
