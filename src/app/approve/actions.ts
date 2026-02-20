'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function verifyTaskPassword(taskId: string, formData: FormData) {
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const supabase = await createClient()

    if (!name || name.trim().length < 2) {
        return { error: "Por favor, insira seu nome." }
    }

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

    // Set cookie to remember session and name
    const cookieStore = await cookies()
    cookieStore.set(`task_session_${taskId}`, "authenticated", { httpOnly: true, path: '/' })
    cookieStore.set(`task_approver_${taskId}`, name, { httpOnly: true, path: '/' })

    revalidatePath(`/approve/${taskId}`)
    return { success: true }
}

export async function approveTask(taskId: string) {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const approverName = cookieStore.get(`task_approver_${taskId}`)?.value || "Desconhecido"

    // In a real app, verify cookie here too for extra security

    const { error } = await supabase
        .from("tasks")
        .update({
            status: 'APROVADA',
            approver_name: approverName
        })
        .eq("id", taskId)

    if (error) throw new Error("Failed to approve")

    revalidatePath(`/approve/${taskId}`)
    revalidatePath(`/dashboard`)
}

export async function rejectTask(taskId: string, reason: string) {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const approverName = cookieStore.get(`task_approver_${taskId}`)?.value || "Desconhecido"

    const { error } = await supabase
        .from("tasks")
        .update({
            status: 'REJEITADA',
            feedback: reason,
            approver_name: approverName
        })
        .eq("id", taskId)

    if (error) throw new Error("Failed to reject")

    revalidatePath(`/approve/${taskId}`)
    revalidatePath(`/dashboard`)
}
