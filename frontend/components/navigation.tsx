import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Mic, Settings, User } from "lucide-react"

export function Navigation() {
  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900" prefetch={false}>
          <Mic className="h-6 w-6 text-blue-600" />
          AI Meeting Assistant
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600" prefetch={false}>
              <Home className="h-5 w-5" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link
              href="/sessions"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
              prefetch={false}
            >
              <Mic className="h-5 w-5" />
              Sessions
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link
              href="/coming-soon"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
              prefetch={false}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link
              href="/auth-coming-soon"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
              prefetch={false}
            >
              <User className="h-5 w-5" />
              Account
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
