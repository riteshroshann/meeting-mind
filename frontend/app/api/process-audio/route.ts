import { type NextRequest, NextResponse } from "next/server"

/**
 * Proxies the multipart POST from the browser to the Django backend on Render.
 * CORS is no longer an issue because the browser now talks to the same origin.
 */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (() => {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined – add it in Vercel project settings.")
  })()

export async function POST(req: NextRequest) {
  try {
    // Forward the original multipart/form-data straight through
    const formData = await req.formData()

    const upstream = await fetch(`${BACKEND_URL}/api/process-audio/`, {
      method: "POST",
      body: formData,
      // Let fetch set multipart boundaries automatically
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      return NextResponse.json({ error: `Upstream error ${upstream.status}: ${text}` }, { status: upstream.status })
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: `Proxy failure: ${err.message}` }, { status: 500 })
  }
}

// Optional: preflight for large uploads
export const config = {
  api: {
    bodyParser: false,
  },
}
