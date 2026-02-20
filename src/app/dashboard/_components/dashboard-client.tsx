'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Grid, List, Trash2, Video, AlertCircle, Upload, Loader2, X, Plus, RotateCcw, Monitor } from "lucide-react"
import Link from "next/link"
import { CopyPasswordButton } from "./copy-password-button"
import { DeleteTaskButton } from "./delete-task-button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { addNewVersion, updateTaskStatus } from "@/app/actions"
import { useRouter } from "next/navigation"

import { PlatformIcon } from "@/components/platform-icon"

interface TaskImage {
    id: string
    status: string
    url: string
    feedback?: string
}

interface Task {
    id: string
    client_name: string
    title: string
    type: string
    created_at: string
    access_password: string
    task_images: TaskImage[]
    media_url: string | null
    status: string
    platform?: string
    approver_name?: string
}

interface DashboardClientProps {
    tasks: Task[]
}

const STATUS_OPTIONS = [
    { label: "EM PRODUÇÃO", value: "EM PRODUÇÃO", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "AGUARDANDO APROVAÇÃO", value: "AGUARDANDO APROVAÇÃO", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { label: "APROVADA", value: "APROVADA", color: "bg-green-100 text-green-700 border-green-200" },
    { label: "REJEITADA", value: "REJEITADA", color: "bg-red-100 text-red-700 border-red-200" },
]

function StatusSelector({ taskId, currentStatus }: { taskId: string, currentStatus: string | null }) {
    const router = useRouter()
    const [isUpdating, setIsUpdating] = useState(false)

    // Normalize status from legacy lowercase to uppercase
    let normalizedStatus = currentStatus || "EM PRODUÇÃO"
    if (normalizedStatus === 'approved') normalizedStatus = 'APROVADA'
    if (normalizedStatus === 'rejected') normalizedStatus = 'REJEITADA'
    if (normalizedStatus === 'pending') normalizedStatus = 'AGUARDANDO APROVAÇÃO' // just in case

    const status = normalizedStatus

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true)
        try {
            const result = await updateTaskStatus(taskId, newStatus)
            if (result.error) {
                toast.error("Erro ao atualizar status: " + result.error)
            } else {
                toast.success("Status atualizado!")
                router.refresh()
            }
        } catch (error) {
            toast.error("Erro inesperado ao atualizar status")
        } finally {
            setIsUpdating(false)
        }
    }

    const currentOption = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0]

    return (
        <Select onValueChange={handleStatusChange} value={status} disabled={isUpdating}>
            <SelectTrigger className={`h-6 text-[10px] uppercase tracking-wider font-bold px-2.5 w-fit rounded-full border shadow-sm transition-all hover:scale-105 active:scale-95 ${currentOption.color}`}>
                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    <SelectValue />
                </div>
            </SelectTrigger>
            <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[11px] font-medium">
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

function NewVersionDialog({ task, onOpenChange }: { task: Task, onOpenChange: (open: boolean) => void }) {
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles])

            const newPreviews = newFiles.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        URL.revokeObjectURL(previews[index])
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleUpload = async () => {
        if (files.length === 0) return

        setIsUploading(true)
        const uploadedUrls: string[] = []

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('task-assets')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('task-assets')
                    .getPublicUrl(filePath)

                uploadedUrls.push(publicUrl)
            }

            const result = await addNewVersion(task.id, uploadedUrls)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Nova versão enviada com sucesso!")
                onOpenChange(false)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao fazer upload dos arquivos.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Nova Versão</DialogTitle>
                <DialogDescription>
                    Envie as correções para: <span className="font-semibold">{task.title}</span>
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Clique para selecionar arquivos</p>
                    <Input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>

                {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeFile(index)
                                    }}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Correção
                </Button>
            </div>
        </DialogContent>
    )
}

export function DashboardClient({ tasks = [] }: DashboardClientProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 ml-2 uppercase tracking-tighter">Suas Tarefas</h2>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                {selectedTask && <NewVersionDialog task={selectedTask} onOpenChange={setIsDialogOpen} />}
            </Dialog>

            {viewMode === 'grid' ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {tasks.map((task) => {
                        const images = task.task_images || []
                        const approvedCount = images.filter((img) => img.status === 'approved').length
                        const totalCount = images.length
                        const rejectedImages = images.filter(img => img.status === 'rejected')
                        const hasRejections = rejectedImages.length > 0
                        const firstImage = images[0]?.url || task.media_url

                        return (
                            <Card key={task.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="overflow-hidden pr-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <PlatformIcon platform={task.platform} className="h-4 w-4 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{task.client_name}</span>
                                            </div>
                                            <CardTitle className="truncate text-lg" title={task.title}>{task.title}</CardTitle>
                                        </div>
                                        <div className="flex flex-col gap-2 items-end">
                                            <Badge variant={approvedCount === totalCount && totalCount > 0 ? "default" : (hasRejections ? "destructive" : "secondary")}>
                                                {approvedCount}/{totalCount}
                                            </Badge>
                                            <StatusSelector taskId={task.id} currentStatus={task.status} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="aspect-video w-full rounded-md bg-muted/50 overflow-hidden relative group border flex items-center justify-center">
                                        {task.type === 'video' ? (
                                            <div className="flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                                <Video className="h-10 w-10 mb-2" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Vídeo</span>
                                            </div>
                                        ) : task.type === 'website' ? (
                                            <div className="flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                                <Monitor className="h-10 w-10 mb-2" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Site / Figma</span>
                                            </div>
                                        ) : (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={firstImage || ""} alt={task.title} className="w-full h-full object-cover" />
                                        )}

                                        {/* Platform Overlay */}
                                        <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm">
                                            <PlatformIcon platform={task.platform} className="h-4 w-4 text-slate-700" />
                                        </div>
                                    </div>

                                    {((task.status === 'APROVADA' || task.status === 'approved') || (task.status === 'REJEITADA' || task.status === 'rejected')) && task.approver_name && (
                                        <div className="text-[10px] text-center font-medium bg-slate-50 py-1 rounded border border-slate-100 text-slate-500 uppercase tracking-tight">
                                            {(task.status === 'APROVADA' || task.status === 'approved') ? "Aprovado por" : "Rejeitado por"}: <span className="font-bold text-slate-700">{task.approver_name}</span>
                                        </div>
                                    )}

                                    {hasRejections && (
                                        <div className="space-y-2 border-t pt-2">
                                            <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Rejeições
                                            </h4>
                                            <div className="space-y-2">
                                                {rejectedImages.map((img) => (
                                                    <div key={img.id} className="flex items-start gap-3 bg-red-50 p-2 rounded-md border border-red-100">
                                                        <div className="h-10 w-10 shrink-0 rounded overflow-hidden border border-red-200">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={img.url} alt="Rejeitado" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-xs text-red-700 italic line-clamp-2" title={img.feedback}>
                                                                "{img.feedback || "Sem feedback"}"
                                                            </p>
                                                            {task.approver_name && <p className="text-[9px] font-bold text-red-400 mt-1 uppercase">por {task.approver_name}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between gap-2 border-t pt-4 mt-auto">
                                    <div className="flex gap-2">
                                        <Link href={`/approve/${task.id}`} target="_blank">
                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Abrir Link">
                                                <ExternalLink className="h-4 w-4" />
                                                <span className="sr-only">Abrir</span>
                                            </Button>
                                        </Link>
                                        <CopyPasswordButton password={task.access_password} />
                                    </div>
                                    <div className="flex gap-2">
                                        {hasRejections && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 bg-blue-600 hover:bg-blue-700"
                                                onClick={() => {
                                                    setSelectedTask(task)
                                                    setIsDialogOpen(true)
                                                }}
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" />
                                                Corrigir
                                            </Button>
                                        )}
                                        <DeleteTaskButton taskId={task.id} />
                                    </div>
                                </CardFooter>
                            </Card>
                        )
                    })}
                    {tasks.length === 0 && (
                        <div className="col-span-full text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Nenhuma tarefa</h3>
                            <p className="text-sm text-slate-500 mb-6">Comece criando sua primeira tarefa de aprovação.</p>
                            <Link href="/dashboard/create">
                                <Button className="rounded-full bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Tarefa
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-2xl border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="w-[80px]">Mídia</TableHead>
                                <TableHead className="w-[150px]">Cliente</TableHead>
                                <TableHead>Tarefa</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aprovador</TableHead>
                                {tasks.some(t => t.task_images?.some(img => img.status === 'rejected')) && (
                                    <TableHead>Feedback / Rejeições</TableHead>
                                )}
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task) => {
                                const images = task.task_images || []
                                const approvedCount = images.filter((img) => img.status === 'approved').length
                                const totalCount = images.length
                                const rejectedImages = images.filter(img => img.status === 'rejected')
                                const hasRejections = rejectedImages.length > 0
                                const firstImage = images[0]?.url || task.media_url

                                return (
                                    <TableRow key={task.id}>
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                <PlatformIcon platform={task.platform} className="h-5 w-5 text-slate-400" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-10 w-16 bg-muted/50 rounded overflow-hidden relative border flex items-center justify-center">
                                                {task.type === 'video' ? (
                                                    <Video className="h-4 w-4 text-muted-foreground opacity-40" />
                                                ) : task.type === 'website' ? (
                                                    <Monitor className="h-4 w-4 text-muted-foreground opacity-40" />
                                                ) : (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={firstImage || ""} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{task.client_name}</TableCell>
                                        <TableCell className="max-w-[150px] truncate" title={task.title}>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold">{task.title}</span>
                                                <StatusSelector taskId={task.id} currentStatus={task.status} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={approvedCount === totalCount && totalCount > 0 ? "default" : (hasRejections ? "destructive" : "secondary")}>
                                                {approvedCount}/{totalCount}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                            {task.approver_name || "-"}
                                        </TableCell>
                                        {tasks.some(t => t.task_images?.some(img => img.status === 'rejected')) && (
                                            <TableCell>
                                                {hasRejections ? (
                                                    <div className="space-y-1 py-1">
                                                        {rejectedImages.map((img) => (
                                                            <div key={img.id} className="text-sm flex items-center gap-2 text-red-600 bg-red-50 p-1 rounded-md border border-red-100">
                                                                <div className="h-6 w-6 shrink-0 rounded overflow-hidden border border-red-200">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                                <span className="truncate max-w-[200px] text-[11px]" title={img.feedback}>
                                                                    {img.feedback || "Sem feedback"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs font-medium opacity-30">Pendente</span>
                                                )}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                {hasRejections && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="h-8 bg-blue-600 hover:bg-blue-700"
                                                        onClick={() => {
                                                            setSelectedTask(task)
                                                            setIsDialogOpen(true)
                                                        }}
                                                    >
                                                        <RotateCcw className="h-3 w-3 mr-1" />
                                                        Corrigir
                                                    </Button>
                                                )}
                                                <Link href={`/approve/${task.id}`} target="_blank">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Visualizar Link">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <CopyPasswordButton password={task.access_password} />
                                                <DeleteTaskButton taskId={task.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
