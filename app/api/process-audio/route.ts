import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://backened-baby-one.onrender.com"

export async function POST(req: NextRequest) {
  try {
    console.log("[Proxy] Forwarding request to Django backend:", BACKEND_URL)

    // Get the form data from the request
    const formData = await req.formData()

    // Forward the request to Django backend
    const response = await fetch(`${BACKEND_URL}/api/process-audio/`, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type, let fetch handle it for FormData
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Proxy] Backend error:", response.status, errorText)
      return NextResponse.json(
        { error: `Backend error: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[Proxy] Error forwarding request:", error)
    return NextResponse.json({ error: `Proxy error: ${error.message}` }, { status: 500 })
  }
}
