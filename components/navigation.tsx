"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Brain, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Sessions", href: "/sessions" },
    { name: "Coming Soon", href: "/coming-soon" },
  ]

  return (
    <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-white/10 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-white">MeetingMind</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white text-white/80",
                  pathname === item.href ? "text-white" : "text-white/60",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              className="bg-transparent border-white/30 text-white hover:bg-white hover:text-black hover:border-white"
              size="sm"
              asChild
            >
              <Link href="/auth-coming-soon">Sign In</Link>
            </Button>
            <Button className="bg-white text-black hover:bg-white/90" size="sm" asChild>
              <Link href="/auth-coming-soon">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t bg-black/90 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 text-base font-medium rounded-md transition-colors text-white/80",
                    pathname === item.href
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 space-y-2">
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-white/30 text-white hover:bg-white hover:text-black hover:border-white"
                  size="sm"
                  asChild
                >
                  <Link href="/auth-coming-soon" onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full bg-white text-black hover:bg-white/90" size="sm" asChild>
                  <Link href="/auth-coming-soon" onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
