import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Building2 } from "lucide-react"
import { getClients } from "./clients/actions"
import { ClientList } from "./_components/client-list"

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
    const clients = await getClients()

    // Ensure created_at is a string for serialization
    const formattedClients = clients.map(c => ({
        ...c,
        created_at: c.created_at
    }))

    return (
        <div className="grid gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Selecione um cliente para acessar os materiais.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/create">
                        <Button size="sm" variant="outline" className="h-8 gap-1">
                            <Plus className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Nova Tarefa
                            </span>
                        </Button>
                    </Link>
                    <Link href="/dashboard/clients/create">
                        <Button size="sm" className="h-8 gap-1">
                            <Plus className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Novo Cliente
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>

            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg py-32 bg-slate-50/50">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-500">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Nenhum cliente encontrado</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm mb-6">
                        Adicione clientes para começar a organizar seus projetos em pastas.
                    </p>
                    <Link href="/dashboard/clients/create">
                        <Button>Adicionar Primeiro Cliente</Button>
                    </Link>
                </div>
            ) : (
                <ClientList clients={formattedClients} />
            )}
        </div>
    )
}
