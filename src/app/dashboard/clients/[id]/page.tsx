import { getClient, getClientYears, getClientMonths, getClientTasksByMonth } from "../actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Folder, Calendar, Plus } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DashboardClient } from "@/app/dashboard/_components/dashboard-client"
import { FolderActions } from "@/app/dashboard/_components/folder-actions"
import { MetaIntegration } from "@/app/dashboard/_components/meta-integration"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ year?: string; month?: string }>
}

export default async function ClientCheckPage(props: PageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const client = await getClient(params.id)

    if (!client) {
        notFound()
    }

    const year = searchParams.year ? parseInt(searchParams.year) : undefined
    const month = searchParams.month ? parseInt(searchParams.month) : undefined

    // Navigation Breadcrumbs / Header
    const Header = () => (
        <div className="flex flex-col gap-4 mb-8">
            <Link
                href={month !== undefined ? `/dashboard/clients/${client.id}?year=${year}` : year !== undefined ? `/dashboard/clients/${client.id}` : "/dashboard/clients"}
                className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {month !== undefined ? "Voltar para o Ano" : year !== undefined ? "Voltar para Anos" : "Voltar para Clientes"}
            </Link>

            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm p-2">
                    {client.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={client.logo_url} alt={client.name} className="w-full h-full object-contain" />
                    ) : (
                        <Folder className="h-8 w-8 text-slate-300" />
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{client.name}</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            {year ? (
                                <>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{year}</span>
                                    {month !== undefined && (
                                        <>
                                            <span>/</span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                                {new Date(year, month).toLocaleString('pt-BR', { month: 'long' })}
                                            </span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <span className="opacity-60">Selecione o ano para ver os arquivos</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Only show "New Folder" buttons if we are at the top level (Years) or year level (Months) */}
                            {month === undefined && (
                                <FolderActions clientId={client.id} currentYear={year} />
                            )}

                            <Link href={`/dashboard/create?clientId=${client.id}`}>
                                <Button size="sm" className="h-7 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-3 w-3 mr-1.5" />
                                    Nova Tarefa
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    // View: List of Years
    if (!year) {
        const years = await getClientYears(client.id)

        return (
            <div className="w-full">
                <Header />
                {years.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-slate-50/50">
                        <Folder className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Nenhuma pasta encontrada</h3>
                        <p className="text-sm text-slate-500 mb-4">Este cliente ainda não tem tarefas ou pastas.</p>
                        <FolderActions clientId={client.id} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {years.map(y => (
                            <Link key={y} href={`/dashboard/clients/${client.id}?year=${y}`}>
                                <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-slate-200 bg-white">
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-4 pt-8">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                                            <Calendar className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {y}
                                        </h3>
                                    </CardContent>
                                    <CardFooter className="bg-slate-50/50 p-3 flex justify-center border-t border-slate-50">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500">
                                            Abrir Pasta
                                        </span>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // View: List of Months
    if (year && month === undefined) {
        const months = await getClientMonths(client.id, year)

        return (
            <div className="w-full">
                <Header />
                {months.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-slate-50/50">
                        <Folder className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Nenhuma pasta encontrada</h3>
                        <p className="text-sm text-slate-500 mb-4">Adicione meses a este ano para organizar tarefas.</p>
                        <FolderActions clientId={client.id} currentYear={year} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {months.map(m => {
                            const monthName = new Date(year, m).toLocaleString('pt-BR', { month: 'long' })
                            return (
                                <Link key={m} href={`/dashboard/clients/${client.id}?year=${year}&month=${m}`}>
                                    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-slate-200 bg-white">
                                        <CardContent className="p-6 flex flex-col items-center text-center gap-4 pt-8">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
                                                <Folder className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors duration-300 fill-indigo-200 group-hover:fill-white/20" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">
                                                {monthName}
                                            </h3>
                                        </CardContent>
                                        <CardFooter className="bg-slate-50/50 p-3 flex justify-center border-t border-slate-50">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500">
                                                Ver Arquivos
                                            </span>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    // View: Tasks
    // At this point, both year and month are defined numbers because of the checks above
    if (year === undefined || month === undefined) return null

    const tasks = await getClientTasksByMonth(client.id, year, month)

    // Ensure task_images is always an array
    const formattedTasks = tasks.map(task => ({
        ...task,
        task_images: task.task_images || []
    }))

    return (
        <div className="w-full">
            <Header />
            <div className="space-y-8">
                <DashboardClient tasks={formattedTasks} />
                <MetaIntegration
                    clientId={client.id}
                    clientName={client.name}
                    isMetaConnected={!!client.meta_access_token}
                    igBusinessName={client.meta_ig_business_id}
                />
            </div>
        </div>
    )
}
