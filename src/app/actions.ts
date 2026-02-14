'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createTask(formData: FormData) {
    const supabase = await createClient()

    const client_name = formData.get("client_name") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string
    const media_urls_raw = formData.getAll("media_url") as string[]
    const external_url = formData.get("external_url") as string
    const access_password = formData.get("access_password") as string

    // Process URLs (filter empty ones)
    const urls = media_urls_raw.map(u => u.trim()).filter(u => u.length > 0)

    // Use external_url or first media_url for the main column
    // The media_url column in DB is NOT NULL, so we provide the external link if no images exist
    const mainMediaUrl = urls.length > 0 ? urls[0] : (external_url || "external_link")

    // Insert task
    const { data: task, error: taskError } = await supabase.from("tasks").insert({
        client_name,
        title,
        description,
        type,
        media_url: mainMediaUrl,
        external_url: external_url || null,
        access_password,
        status: (urls.length > 0 || external_url) ? 'AGUARDANDO APROVAÇÃO' : 'EM PRODUÇÃO'
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
    return { success: true, task }
}

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

            await supabase.from("tasks").update({ status: nextStatus }).eq("id", taskId)
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

    const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId)

    if (error) {
        console.error("Error updating task status:", error)
        return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
}
