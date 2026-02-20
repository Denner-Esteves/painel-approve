import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")

    if (!clientId) {
        return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    const FB_APP_ID = process.env.META_APP_ID
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`

    // We use the clientId as the state to know which client to update in the callback
    const state = clientId

    const scopes = [
        "public_profile",
        "instagram_basic",
        "instagram_content_publish",
        "pages_show_list",
        "pages_read_engagement"
    ].join(",")

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${scopes}`

    return NextResponse.redirect(authUrl)
}
