'use client'

import { useState, useRef } from "react"
import Link from "next/link"
import { Building2, Folder, Grid, List, Pencil, Upload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateClient } from "../clients/actions"
import { useRouter } from "next/navigation"

interface Client {
    id: string
    name: string
    logo_url: string | null
    created_at: string
}

interface ClientListProps {
    clients: Client[]
}

export function ClientList({ clients }: ClientListProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                    <Button
                        variant={viewMode === 'grid' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={`h-8 px-3 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Grid className="h-4 w-4 mr-1.5" />
                        <span className="text-[10px] uppercase">Grade</span>
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`h-8 px-3 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <List className="h-4 w-4 mr-1.5" />
                        <span className="text-[10px] uppercase">Lista</span>
                    </Button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {clients.map((client) => (
                        <div key={client.id} className="relative group">
                            <Link href={`/dashboard/clients/${client.id}`}>
                                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200 overflow-hidden h-full">
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-4 pt-10">
                                        <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300 p-2">
                                            {client.logo_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={client.logo_url} alt={client.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <Building2 className="h-10 w-10 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1" title={client.name}>
                                                {client.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                Acessar Pastas
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-slate-50/50 p-4 flex justify-between border-t border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                                            <Folder className="h-3 w-3" />
                                            Abrir
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    setEditingClient(client)
                                    setIsDialogOpen(true)
                                }}
                            >
                                <Pencil className="h-4 w-4 text-slate-500" />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Logo</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Data de Criação</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id} className="group">
                                    <TableCell>
                                        <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
                                            {client.logo_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={client.logo_url} alt="" className="w-full h-full object-contain" />
                                            ) : (
                                                <Building2 className="h-5 w-5 text-slate-300" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900">
                                        <Link href={`/dashboard/clients/${client.id}`} className="hover:text-blue-600 hover:underline">
                                            {client.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(client.created_at).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingClient(client)
                                                setIsDialogOpen(true)
                                            }}
                                        >
                                            <Pencil className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                {editingClient && (
                    <EditClientDialog
                        client={editingClient}
                        onClose={() => setIsDialogOpen(false)}
                        onSuccess={() => {
                            setIsDialogOpen(false)
                            router.refresh()
                        }}
                    />
                )}
            </Dialog>
        </div>
    )
}

function EditClientDialog({ client, onClose, onSuccess }: { client: Client, onClose: () => void, onSuccess: () => void }) {
    const [name, setName] = useState(client.name)
    const [isLoading, setIsLoading] = useState(false)
    const [logo, setLogo] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(client.logo_url)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setLogo(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append("id", client.id)
            formData.append("name", name)
            if (logo) {
                formData.append("logo", logo)
            }

            const result = await updateClient(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Cliente atualizado com sucesso!")
                onSuccess()
            }
        } catch (error) {
            toast.error("Erro ao atualizar cliente")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogDescription>
                    Atualize as informações do cliente abaixo.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Empresa</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="flex items-center gap-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors bg-white overflow-hidden relative group"
                            >
                                {preview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={preview} alt="Preview" className="w-full h-full object-contain p-1" />
                                ) : (
                                    <Upload className="h-6 w-6 text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Pencil className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    Alterar Logo
                                </Button>
                                <p className="text-[10px] text-slate-500 mt-1">Clique na imagem ou no botão para alterar.</p>
                            </div>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}
