import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

import DarkVeil from "@/components/dark-veil"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Meeting Assistant",
  description:
    "Transform your meeting recordings into actionable insights with AI-powered transcription, translation, and summarization",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} aria-hidden="true">
          <DarkVeil />
        </div>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div style={{ position: "relative", zIndex: 1 }}>
            {children}
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
