import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedBackground } from "@/components/animated-background"
import { Shield, ArrowLeft, User, Lock, Key } from "lucide-react"
import Link from "next/link"

export default function AuthComingSoonPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navigation />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Shield className="h-24 w-24 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Authentication Coming Soon</h1>
            <p className="text-xl text-gray-600 mb-8">
              We're building a secure authentication system to protect your meeting data and enable personalized
              features.
            </p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <User className="h-5 w-5 text-blue-600" />
                Upcoming Features
              </CardTitle>
              <CardDescription>What you can expect from our authentication system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Secure Login</h3>
                  <p className="text-sm text-gray-600">Multi-factor authentication</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">User Profiles</h3>
                  <p className="text-sm text-gray-600">Personalized settings</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Key className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Session Management</h3>
                  <p className="text-sm text-gray-600">Save and organize meetings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Link href="/sessions">Use Without Account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
