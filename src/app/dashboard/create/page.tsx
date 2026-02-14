'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTask } from "@/app/actions"
import { useState, useRef } from "react"
import { ArrowLeft, RefreshCw, Upload, X, Loader2, Smartphone, Play, Heart, ExternalLink } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function CreateTaskPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [password, setPassword] = useState(() => Math.random().toString(36).slice(-8))

    // Form State
    const [clientName, setClientName] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState("instagram_post")
    const [externalUrl, setExternalUrl] = useState("")

    // File State
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const isLinkType = type === 'video' || type === 'website'

    const generatePassword = () => {
        setPassword(Math.random().toString(36).slice(-8))
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setSelectedFiles(prev => [...prev, ...newFiles])

            const newPreviews = newFiles.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index)
        const newPreviews = previews.filter((_, i) => i !== index)
        URL.revokeObjectURL(previews[index])
        setSelectedFiles(newFiles)
        setPreviews(newPreviews)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isLinkType && selectedFiles.length === 0) {
            toast.error("Por favor, selecione pelo menos um arquivo de mídia.")
            return
        }

        if (isLinkType && !externalUrl) {
            toast.error("Por favor, insira o link do vídeo ou site.")
            return
        }

        setIsLoading(true)
        const supabase = createClient()
        const uploadedUrls: string[] = []

        try {
            // Upload files if not a link type
            if (!isLinkType) {
                for (const file of selectedFiles) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
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
            }

            // Create FormData for server action
            const formData = new FormData()
            formData.append("client_name", clientName)
            formData.append("title", title)
            formData.append("description", description)
            formData.append("type", type)
            formData.append("access_password", password)

            if (isLinkType) {
                formData.append("external_url", externalUrl)
            } else {
                uploadedUrls.forEach(url => formData.append("media_url", url))
            }

            const result = await createTask(formData)

            if (result.success) {
                toast.success("Tarefa criada com sucesso!")
                // Brief delay to allow the toast to be seen
                setTimeout(() => {
                    window.location.href = "/dashboard"
                }, 1000)
            } else {
                throw new Error("Falha na resposta do servidor")
            }

        } catch (error) {
            console.error("Erro ao criar tarefa:", error)
            toast.error("Erro ao criar tarefa. Tente novamente.")
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full p-4 sm:p-8">
            <div className="mb-8">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o Painel
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">

                {/* Left Column: Form */}
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-8">
                        <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Criar Nova Tarefa</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">
                            Configure os detalhes do material para aprovação.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6 lg:p-10 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="client_name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nome do Cliente</Label>
                                    <Input
                                        id="client_name"
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        placeholder="Empresa XPTO"
                                        required
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Título da Tarefa</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Post Instagram #1"
                                        required
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Descrição / Comentário</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Breve descrição ou orientações"
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tipo de Material</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="instagram_post">Post Instagram</SelectItem>
                                        <SelectItem value="video">Vídeo (YouTube/Vimeo)</SelectItem>
                                        <SelectItem value="website">Site / Figma</SelectItem>
                                        <SelectItem value="other">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {isLinkType ? (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Label htmlFor="external_url" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Link do {type === 'video' ? 'Vídeo' : 'Site/Figma'}</Label>
                                    <Input
                                        id="external_url"
                                        value={externalUrl}
                                        onChange={e => setExternalUrl(e.target.value)}
                                        placeholder={type === 'video' ? "https://youtube.com/watch?v=..." : "https://figma.com/file/..."}
                                        required
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Arquivos de Mídia</Label>
                                    <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors cursor-pointer border-slate-200" onClick={() => fileInputRef.current?.click()}>
                                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                            <Upload className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">Clique para selecionar arquivos</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Imagens ou Vídeos</p>
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </div>

                                    {selectedFiles.length > 0 && (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group border-2 border-slate-100 shadow-sm">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2 border-t border-slate-100 pt-6">
                                <Label htmlFor="access_password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Senha de Acesso</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="access_password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-mono tracking-wider"
                                    />
                                    <Button type="button" variant="outline" className="h-12 w-12 rounded-xl flex-shrink-0" onClick={generatePassword}>
                                        <RefreshCw className="h-4 w-4 text-slate-500" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black italic uppercase tracking-tighter" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                {isLoading ? "CRIANDO..." : "CRIAR TAREFA"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Right Column: Mobile Preview */}
                <div className="sticky top-8 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                        <Smartphone className="h-4 w-4 text-slate-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Preview</h3>
                    </div>

                    <div className="w-full h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] overflow-hidden relative ring-1 ring-slate-900/10 max-w-[300px]">
                        {/* Status Bar */}
                        <div className="absolute top-0 w-full h-8 bg-slate-900 z-20 flex justify-between px-8 items-center text-[10px] text-white font-medium">
                            <span>16:20</span>
                            <div className="flex gap-1.5 pt-1">
                                <div className="w-3 h-1 rounded-full bg-white opacity-20"></div>
                                <div className="w-6 h-1 rounded-full bg-white opacity-40"></div>
                            </div>
                        </div>

                        {/* Screen Content */}
                        <div className="w-full h-full bg-slate-50 relative flex flex-col pt-8">
                            <div className="p-6 text-center shrink-0 bg-white shadow-sm z-10">
                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] truncate">
                                    {clientName || "CLIENTE"}
                                </p>
                                <h2 className="text-sm font-black mt-1 text-slate-900 truncate uppercase tracking-tighter italic leading-none">
                                    {title || "Tarefa #01"}
                                </h2>
                                <div className="mt-3 inline-block px-3 py-1 bg-slate-50 rounded-full text-[8px] font-black text-slate-300 border border-slate-100 tracking-widest uppercase">
                                    {isLinkType ? "LINK EXTERNO" : `ITEM 1 / ${Math.max(1, selectedFiles.length)}`}
                                </div>
                            </div>

                            <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
                                <div className="w-full aspect-[3/4.5] bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden relative">
                                    {isLinkType ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                                            <div className="h-16 w-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center mb-6 shadow-sm ring-1 ring-blue-100">
                                                {type === 'video' ? <Play className="h-7 w-7 text-blue-500 fill-blue-500" /> : <ExternalLink className="h-7 w-7 text-blue-500" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Conteúdo Externo</p>
                                                <p className="text-[9px] text-slate-400 truncate max-w-[150px] font-medium">{externalUrl || "https://link-do-material.com"}</p>
                                            </div>
                                            <div className="w-full mt-auto p-4 text-left bg-slate-50 rounded-2xl border border-slate-100 italic text-[9px] text-slate-500 leading-relaxed font-medium">
                                                "{description || "As orientações que você digitar aparecerão aqui no rodapé para o cliente..."}"
                                            </div>
                                        </div>
                                    ) : previews.length > 0 ? (
                                        <div className="w-full h-full relative bg-slate-950">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={previews[0]} alt="Preview" className="w-full h-full object-cover opacity-90" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                                                <p className="text-[11px] font-medium opacity-95 leading-relaxed italic line-clamp-3">
                                                    "{description || "A descrição do material aparece aqui para o cliente..."}"
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50/50">
                                            <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
                                                <Smartphone className="h-6 w-6 opacity-20" />
                                            </div>
                                            <p className="text-[10px] uppercase font-black tracking-widest opacity-30">Aguardando Mídia</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 flex justify-center gap-8 bg-slate-50/50 shrink-0">
                                <div className="h-12 w-12 rounded-full border-2 border-slate-200 flex items-center justify-center shadow-lg bg-white">
                                    <X className="h-6 w-6 text-red-500 stroke-[3]" />
                                </div>
                                <div className="h-12 w-12 rounded-full border-2 border-slate-200 flex items-center justify-center shadow-lg bg-white">
                                    <Heart className="h-6 w-6 text-green-500 fill-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
