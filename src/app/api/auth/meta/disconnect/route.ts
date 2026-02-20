import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const { clientId } = await request.json()

        if (!clientId) {
            return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
        }

        const supabase = await createClient()
        const { error } = await supabase
            .from("clients")
            .update({
                meta_access_token: null,
                meta_token_expires_at: null,
                meta_page_id: null,
                meta_ig_business_id: null
            })
            .eq("id", clientId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Erro ao desconectar Meta:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
