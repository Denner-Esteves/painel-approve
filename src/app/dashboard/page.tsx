import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./_components/dashboard-client"

// Force dynamic rendering to fetch fresh data on every request
export const dynamic = 'force-dynamic'

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*, task_images(id, status, url, feedback)')
        .order('created_at', { ascending: false })

    // Safe cast or transformation to match the interface if needed, 
    // but usually Supabase return type is close enough.
    // We ensure task_images is an array.
    const formattedTasks = tasks?.map(task => ({
        ...task,
        task_images: task.task_images || []
    })) || []

    return (
        <div className="grid gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tarefas</h2>
                    <p className="text-muted-foreground">Gerencie as tarefas de aprovação dos clientes.</p>
                </div>
                <Link href="/dashboard/create">
                    <Button size="sm" className="h-8 gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Criar Tarefa
                        </span>
                    </Button>
                </Link>
            </div>

            <DashboardClient tasks={formattedTasks} />
        </div>
    )
}
