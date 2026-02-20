import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const clientId = searchParams.get("state") // We passed clientId as state
    const error = searchParams.get("error")

    if (error) {
        console.error("Erro na autenticação Meta:", error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/${clientId}?error=meta_auth_failed`)
    }

    if (!code || !clientId) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients?error=missing_params`)
    }

    try {
        const FB_APP_ID = process.env.META_APP_ID
        const FB_APP_SECRET = process.env.META_APP_SECRET
        const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`

        // 1. Exchange code for short-lived access token
        const tokenResponse = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${FB_APP_SECRET}&code=${code}`
        )
        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            throw new Error(tokenData.error.message)
        }

        const shortLivedToken = tokenData.access_token

        // 2. Exchange for long-lived access token (60 days)
        const longLivedResponse = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
        )
        const longLivedData = await longLivedResponse.json()
        const longLivedToken = longLivedData.access_token

        // 3. Fetch Facebook Page and Instagram Business Account
        // Note: For simplicity, we'll take the first page that has an IG business account linked
        const pagesResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}&fields=name,id,instagram_business_account`
        )
        const pagesData = await pagesResponse.json()

        let metaPageId = null
        let metaIgBusinessId = null

        if (pagesData.data && pagesData.data.length > 0) {
            // Find a page that has an IG Business Account
            const pageWithIg = pagesData.data.find((p: any) => p.instagram_business_account)

            if (pageWithIg) {
                metaPageId = pageWithIg.id
                metaIgBusinessId = pageWithIg.instagram_business_account.id
            } else {
                // If no IG linked, just take the first page ID
                metaPageId = pagesData.data[0].id
            }
        }

        // 4. Save to DB
        const supabase = await createClient()
        const { error: updateError } = await supabase
            .from("clients")
            .update({
                meta_access_token: longLivedToken,
                meta_page_id: metaPageId,
                meta_ig_business_id: metaIgBusinessId,
                meta_token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq("id", clientId)

        if (updateError) throw updateError

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/${clientId}?success=meta_connected`)

    } catch (err: any) {
        console.error("Erro ao processar callback Meta:", err)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/${clientId}?error=meta_token_exchange_failed`)
    }
}
