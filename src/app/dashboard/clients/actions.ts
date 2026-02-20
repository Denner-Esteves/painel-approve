'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createNewClient(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const logoFile = formData.get("logo") as File

    if (!name) {
        return { error: "Nome é obrigatório" }
    }

    let logo_url = null

    if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `client-logos/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('task-assets') // Reusing existing bucket, or should we create a new one? Assuming 'task-assets' is fine for now or 'public'
            .upload(fileName, logoFile)

        if (uploadError) {
            console.error("Error uploading logo:", uploadError)
            return { error: "Erro ao fazer upload da logo" }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('task-assets')
            .getPublicUrl(fileName)

        logo_url = publicUrl
    }

    const { data, error } = await supabase
        .from('clients')
        .insert({ name, logo_url })
        .select()
        .single()

    if (error) {
        console.error("Error creating client:", error)
        return { error: "Erro ao criar cliente" }
    }

    revalidatePath("/dashboard/clients")
    return { success: true, client: data }
}

export async function getClients() {
    const supabase = await createClient()

    const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching clients:", error)
        return []
    }

    return clients
}

export async function updateClient(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const logoFile = formData.get("logo") as File

    if (!id || !name) {
        return { error: "ID e Nome são obrigatórios" }
    }

    const updates: { name: string; logo_url?: string } = { name }

    if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `client-logos/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('task-assets')
            .upload(fileName, logoFile)

        if (uploadError) {
            console.error("Error uploading logo:", uploadError)
            return { error: "Erro ao fazer upload da logo" }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('task-assets')
            .getPublicUrl(fileName)

        updates.logo_url = publicUrl
    }

    const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error("Error updating client:", error)
        return { error: "Erro ao atualizar cliente" }
    }

    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/clients/${id}`)
    return { success: true }
}

// Fetch a single client by ID
export async function getClient(id: string) {
    const supabase = await createClient()
    const { data: client, error } = await supabase.from('clients').select('*').eq('id', id).single()
    if (error) return null
    return client
}

// Get distinct years for a client's tasks and manual folders
export async function getClientYears(clientId: string) {
    const supabase = await createClient()

    // 1. Get years from tasks
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('created_at')
        .eq('client_id', clientId)

    // 2. Get years from folders
    const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('year')
        .eq('client_id', clientId)

    if (tasksError && foldersError) return []

    const years = new Set<number>()

    // Process tasks
    if (tasks) {
        tasks.forEach(task => {
            const date = new Date(task.created_at)
            years.add(date.getFullYear())
        })
    }

    // Process folders
    if (folders) {
        folders.forEach(folder => {
            years.add(folder.year)
        })
    }

    return Array.from(years).sort((a, b) => b - a)
}

// Get distinct months for a specific year (tasks + manual folders)
export async function getClientMonths(clientId: string, year: number) {
    const supabase = await createClient()

    // 1. Get months from tasks for this year
    const startDetails = `${year}-01-01T00:00:00.000Z`
    const endDetails = `${year}-12-31T23:59:59.999Z`

    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('created_at')
        .eq('client_id', clientId)
        .gte('created_at', startDetails)
        .lte('created_at', endDetails)

    // 2. Get months from folders for this year
    const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('month')
        .eq('client_id', clientId)
        .eq('year', year)
        // We only care about months that are set (though our schema says month INTEGER, it might be null for logic but here we expect months)
        .not('month', 'is', null)

    if (tasksError && foldersError) return []

    const months = new Set<number>()

    // Process tasks
    if (tasks) {
        tasks.forEach(task => {
            const date = new Date(task.created_at)
            months.add(date.getMonth()) // 0-11
        })
    }

    // Process folders
    if (folders) {
        folders.forEach(folder => {
            if (folder.month !== null) {
                months.add(folder.month)
            }
        })
    }

    return Array.from(months).sort((a, b) => b - a)
}

// Create a manual folder
export async function createManualFolder(clientId: string, year: number, month?: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('folders')
        .insert({
            client_id: clientId,
            year: year,
            month: month
        })

    if (error) {
        // Ignore duplicate violations if it's just trying to create what exists
        if (error.code === '23505') return { success: true }
        console.error("Error creating folder:", error)
        return { error: "Erro ao criar pasta" }
    }

    revalidatePath(`/dashboard/clients/${clientId}`)
    return { success: true }
}

// Get tasks for a specific month and year
export async function getClientTasksByMonth(clientId: string, year: number, month: number) {
    const supabase = await createClient()

    // Javascript months are 0-indexed, but let's handle it carefully.
    // We expect 'month' to be 0-11.

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999) // Last day of month

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*, task_images(id, status, url, feedback)')
        .eq('client_id', clientId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

    if (error) return []

    return tasks?.map(task => ({
        ...task,
        task_images: task.task_images || []
    })) || []
}
