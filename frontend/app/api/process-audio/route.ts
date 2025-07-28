import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://ai-meeting-assistant-backend-production.up.railway.app"

export async function POST(request: NextRequest) {
  try {
    console.log("Processing audio request...")

    // Get the form data from the request
    const formData = await request.formData()

    // Log the form data for debugging
    const audio = formData.get("audio") as File
    const sourceLanguage = formData.get("sourceLanguage") as string
    const targetLanguage = formData.get("targetLanguage") as string
    const preMeetingNotes = formData.get("preMeetingNotes") as string

    console.log("Form data received:", {
      audioName: audio?.name,
      audioSize: audio?.size,
      sourceLanguage,
      targetLanguage,
      preMeetingNotesLength: preMeetingNotes?.length || 0,
    })

    if (!audio) {
      return NextResponse.json({ success: false, error: "No audio file provided" }, { status: 400 })
    }

    // Forward the request to the Django backend
    const backendUrl = `${BACKEND_URL}/api/process-audio/`
    console.log("Forwarding to backend:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type header - let fetch set it automatically for FormData
      },
    })

    console.log("Backend response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status },
      )
    }

    const result = await response.json()
    console.log("Backend response received successfully")

    // Return the result from the backend
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in process-audio route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
