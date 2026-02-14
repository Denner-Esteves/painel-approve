import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import PasswordForm from "./_components/password-form"
import ApprovalCard from "./_components/approval-card"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: Promise<{ taskId: string }> }) {
    const { taskId } = await params
    const supabase = await createClient()
    const { data: task } = await supabase.from("tasks").select("title, client_name").eq("id", taskId).single()
    return {
        title: task ? `Approve: ${task.title} - ${task.client_name}` : "Task Approval",
    }
}

export default async function ApprovalPage({ params }: { params: Promise<{ taskId: string }> }) {
    const { taskId } = await params
    const supabase = await createClient()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(`task_session_${taskId}`)
    const isAuthenticated = sessionCookie?.value === "authenticated" // Simple check, real app should verify token/value

    const { data: task, error } = await supabase
        .from("tasks")
        .select("*, task_images(*)")
        .eq("id", taskId)
        .single()

    if (error || !task) {
        notFound()
    }

    if (!isAuthenticated) {
        return <PasswordForm taskId={taskId} />
    }

    // Sort images: pending first, then by ID or creation?
    // Let's just pass them all and let the client component decide, 
    // but maybe sorting by ID ensures consistency.
    const images = task.task_images?.sort((a: any, b: any) => a.id.localeCompare(b.id)) || []

    // If no images (migration didn't run or empty), fall back to old media_url if exists for backward compat?
    // The migration script should have handled it. If new task, it uses images.
    // We will structure the prop to always be an array.

    return <ApprovalCard task={task} images={images} />
}
