'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useRef } from "react"
import { ArrowLeft, Loader2, Upload, X, Building2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { createNewClient } from "../actions"

export default function CreateClientPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [logo, setLogo] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setLogo(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const removeLogo = () => {
        setLogo(null)
        if (preview) {
            URL.revokeObjectURL(preview)
            setPreview(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append("name", name)
            if (logo) {
                formData.append("logo", logo)
            }

            const result = await createNewClient(formData)

            if (result.success) {
                toast.success("Cliente criado com sucesso!")
                setTimeout(() => {
                    window.location.href = "/dashboard/clients"
                }, 1000)
            } else {
                toast.error(result.error || "Erro ao criar cliente")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro inesperado ao criar cliente")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full p-4 sm:p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <Link href="/dashboard/clients" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Clientes
                </Link>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-8">
                    <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Novo Cliente</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">
                        Adicione um novo cliente para organizar seus projetos.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 p-8">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nome da Empresa</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Acme Corp"
                                required
                                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Logo da Empresa</Label>

                            {!preview ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors cursor-pointer border-slate-200 h-40"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                                        <Upload className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Clique para selecionar logo</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">JPG ou PNG</p>
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            ) : (
                                <div className="relative w-32 h-32 mx-auto">
                                    <div className="w-full h-full rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-50 p-2 flex items-center justify-center relative group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeLogo()
                                                }}
                                                className="rounded-full"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black italic uppercase tracking-tighter" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isLoading ? "CRIANDO..." : "CRIAR CLIENTE"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
