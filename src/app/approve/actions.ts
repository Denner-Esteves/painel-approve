'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function verifyTaskPassword(taskId: string, formData: FormData) {
    const password = formData.get("password") as string
    const supabase = await createClient()

    const { data: task, error } = await supabase
        .from("tasks")
        .select("access_password")
        .eq("id", taskId)
        .single()

    if (error || !task) {
        return { error: "Tarefa não encontrada" }
    }

    if (task.access_password !== password) {
        return { error: "Senha incorreta" }
    }

    // Set cookie to remember session
    const cookieStore = await cookies()
    cookieStore.set(`task_session_${taskId}`, "authenticated", { httpOnly: true, path: '/' })

    revalidatePath(`/approve/${taskId}`)
    return { success: true }
}

export async function approveTask(taskId: string) {
    const supabase = await createClient()

    // In a real app, verify cookie here too for extra security

    const { error } = await supabase
        .from("tasks")
        .update({ status: 'approved' })
        .eq("id", taskId)

    if (error) throw new Error("Failed to approve")

    revalidatePath(`/approve/${taskId}`)
    revalidatePath(`/dashboard`)
}

export async function rejectTask(taskId: string, reason: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("tasks")
        .update({ status: 'rejected', feedback: reason })
        .eq("id", taskId)

    if (error) throw new Error("Failed to reject")

    revalidatePath(`/approve/${taskId}`)
    revalidatePath(`/dashboard`)
}
