import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Building2, Folder } from "lucide-react"
import { getClients } from "./actions"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
    const clients = await getClients()

    return (
        <div className="grid gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
                    <p className="text-muted-foreground">Gerencie seus clientes e acesse os materiais organizados.</p>
                </div>
                <Link href="/dashboard/clients/create">
                    <Button size="sm" className="h-8 gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Novo Cliente
                        </span>
                    </Button>
                </Link>
            </div>

            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg py-32 bg-slate-50/50">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-500">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Nenhum cliente encontrado</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm mb-6">
                        Comece adicionando seu primeiro cliente para organizar os materiais.
                    </p>
                    <Link href="/dashboard/clients/create">
                        <Button>Adicionar Cliente</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {clients.map((client) => (
                        <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-slate-200 overflow-hidden h-full">
                                <CardContent className="p-6 flex flex-col items-center text-center gap-4 pt-10">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        {client.logo_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={client.logo_url} alt={client.name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <Building2 className="h-10 w-10 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {client.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                            Ver Pastas
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 p-4 flex justify-center border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                                        <Folder className="h-3 w-3" />
                                        Acessar Arquivos
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
