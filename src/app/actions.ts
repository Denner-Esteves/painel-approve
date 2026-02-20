'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createTask(formData: FormData) {
    const supabase = await createClient()

    const client_id = formData.get("client_id") as string

    // ... [existing client_name logic] ...
    let client_name = formData.get("client_name") as string

    if (client_id) {
        const { data: client } = await supabase.from('clients').select('name').eq('id', client_id).single()
        if (client) {
            client_name = client.name
        }
    }
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string
    const media_urls_raw = formData.getAll("media_url") as string[]
    const external_url = formData.get("external_url") as string
    const access_password = formData.get("access_password") as string
    const platform = formData.get("platform") as string
    const scheduled_date = formData.get("scheduled_date") as string // Added scheduled_date

    // Process URLs (filter empty ones)
    const urls = media_urls_raw.map(u => u.trim()).filter(u => u.length > 0)

    // Use external_url or first media_url for the main column
    // The media_url column in DB is NOT NULL, so we provide the external link if no images exist
    const mainMediaUrl = urls.length > 0 ? urls[0] : (external_url || "external_link")

    // Insert task
    const { data: task, error: taskError } = await supabase.from("tasks").insert({
        client_name,
        client_id: client_id || null,
        title,
        description,
        type,
        media_url: mainMediaUrl,
        external_url: external_url || null,
        access_password,
        status: (urls.length > 0 || external_url) ? 'AGUARDANDO APROVAÇÃO' : 'EM PRODUÇÃO',
        platform: platform || 'instagram_post',
        scheduled_date: scheduled_date || null // Added scheduled_date
    }).select().single()

    if (taskError) {
        console.error("Error creating task:", taskError)
        throw new Error("Failed to create task")
    }



    if (urls.length > 0) {
        const imagesToInsert = urls.map(url => ({
            task_id: task.id,
            url,
            status: 'pending'
        }))

        const { error: imagesError } = await supabase.from("task_images").insert(imagesToInsert)

        if (imagesError) {
            console.error("Error inserting images:", imagesError)
            // Ideally rollback task creation here, but for now just logging
        }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/calendar") // Revalidate calendar

    if (client_id) {
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth()
        return { success: true, task, redirectUrl: `/dashboard/clients/${client_id}?year=${year}&month=${month}` }
    }

    return { success: true, task }
}

export async function getCalendarTasks(startStr: string, endStr: string) {
    const supabase = await createClient()

    // Query tasks within the date range
    // We filter where scheduled_date is NOT NULL and within range
    const { data, error } = await supabase
        .from('tasks')
        .select('id, title, scheduled_date, status, client_name, type, platform')
        .not('scheduled_date', 'is', null)
        .gte('scheduled_date', startStr)
        .lte('scheduled_date', endStr)
        .order('scheduled_date', { ascending: true })

    if (error) {
        console.error("Error fetching calendar tasks:", error)
        return []
    }

    return data
}

import { cookies } from "next/headers"

// ... imports remain the same

export async function updateImageStatus(imageId: string, status: 'approved' | 'rejected', feedback?: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("task_images")
        .update({ status, feedback })
        .eq("id", imageId)

    if (error) {
        console.error("Error updating image status:", error)
        return { error: error.message }
    }

    revalidatePath("/approve/[taskId]", "page") // Revalidate the approval page
    revalidatePath("/dashboard")

    // --- Automatic Status Update ---
    // 1. Get taskId from image
    const { data: imageData } = await supabase.from("task_images").select("task_id").eq("id", imageId).single()
    if (imageData) {
        const taskId = imageData.task_id
        // 2. Fetch all images for this task
        const { data: allImages } = await supabase.from("task_images").select("status").eq("task_id", taskId)

        if (allImages) {
            let nextStatus = 'AGUARDANDO APROVAÇÃO'
            const hasRejected = allImages.some(img => img.status === 'rejected')
            const allApproved = allImages.every(img => img.status === 'approved')

            if (hasRejected) {
                nextStatus = 'REJEITADA'
            } else if (allApproved && allImages.length > 0) {
                nextStatus = 'APROVADA'
            }

            // Determine approver name
            const { data: { user } } = await supabase.auth.getUser()
            let approverName = null

            if (user) {
                approverName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0]
            } else {
                const cookieStore = await cookies()
                approverName = cookieStore.get(`task_approver_${taskId}`)?.value || null
            }

            const updates: any = { status: nextStatus }

            // Only update approver_name if the task is finalized
            if (nextStatus === 'APROVADA' || nextStatus === 'REJEITADA') {
                if (approverName) updates.approver_name = approverName
            }

            await supabase.from("tasks").update(updates).eq("id", taskId)
            revalidatePath("/dashboard")
        }
    }

    return { success: true }
}


export async function deleteTask(taskId: string) {
    const supabase = await createClient()

    try {
        const { error, count } = await supabase
            .from("tasks")
            .delete({ count: 'exact' })
            .eq("id", taskId)

        if (error) {
            console.error("Error deleting task:", error)
            return { error: error.message }
        }

        if (count === 0) {
            return { error: "Task not found or you don't have permission to delete it." }
        }

        revalidatePath("/dashboard")
        return { success: true }
    } catch (err) {
        console.error("Unexpected error deleting task:", err)
        return { error: "An unexpected error occurred" }
    }
}

export async function addNewVersion(taskId: string, urls: string[]) {
    const supabase = await createClient()

    if (!urls || urls.length === 0) {
        return { error: "No images provided" }
    }

    const imagesToInsert = urls.map(url => ({
        task_id: taskId,
        url,
        status: 'pending' // New versions start as pending
    }))

    const { error } = await supabase.from("task_images").insert(imagesToInsert)

    if (error) {
        console.error("Error adding new version:", error)
        return { error: "Failed to add new images" }
    }

    // Set task to AGUARDANDO APROVAÇÃO when new versions are added
    await supabase.from("tasks").update({ status: 'AGUARDANDO APROVAÇÃO' }).eq("id", taskId)

    revalidatePath("/dashboard")
    revalidatePath(`/approve/${taskId}`)
    return { success: true }
}


export async function updateTaskStatus(taskId: string, status: string) {
    const supabase = await createClient()

    // Get current user for audit/approver name
    const { data: { user } } = await supabase.auth.getUser()
    let approverName = null

    if (user) {
        // Try to get name from metadata, fallback to email or "Admin"
        approverName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Admin"
    } else {
        // Check for external approver cookie
        const cookieStore = await cookies()
        approverName = cookieStore.get(`task_approver_${taskId}`)?.value || "Desconhecido"
    }

    const updates: any = { status }

    // If status is final (Approved/Rejected), set the approver name
    if (status === 'APROVADA' || status === 'REJEITADA' || status === 'approved' || status === 'rejected') {
        if (approverName) {
            updates.approver_name = approverName
        }
    } else {
        // If moving back to in-progress, maybe clear the approver?
        updates.approver_name = null
    }

    const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)

    if (error) {
        console.error("Error updating task status:", error)
        return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
}
