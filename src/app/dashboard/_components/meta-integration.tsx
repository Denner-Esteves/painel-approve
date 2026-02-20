"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Instagram, CheckCircle2, AlertCircle, Loader2, Link2Off, X } from "lucide-react"
import { toast } from "sonner"

interface MetaIntegrationProps {
    clientId: string
    clientName: string
    isMetaConnected: boolean
    igBusinessName?: string
}

export function MetaIntegration({
    clientId,
    clientName,
    isMetaConnected,
    igBusinessName
}: MetaIntegrationProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const handleConnect = async () => {
        setIsLoading(true)
        try {
            // This will redirect to our auth endpoint
            window.location.href = `/api/auth/meta?clientId=${clientId}`
        } catch (error) {
            console.error("Erro ao iniciar integração:", error)
            toast.error("Não foi possível iniciar a conexão com a Meta.")
            setIsLoading(false)
        }
    }

    const handleDisconnect = async () => {
        if (!confirm(`Tem certeza que deseja desconectar o Instagram de ${clientName}?`)) return

        setIsLoading(true)
        try {
            const response = await fetch(`/api/auth/meta/disconnect`, {
                method: "POST",
                body: JSON.stringify({ clientId }),
            })

            if (response.ok) {
                toast.success("Conexão removida com sucesso!")
                window.location.reload()
            } else {
                throw new Error("Falha ao desconectar")
            }
        } catch (error) {
            toast.error("Erro ao desconectar.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-24 right-6 z-[100] sm:bottom-8">
            {/* Toggle Button / Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-2xl shadow-slate-400/50 transition-all hover:scale-110 active:scale-95 animate-in fade-in zoom-in duration-300"
                >
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 border-2 border-white">
                        <div className={`h-1.5 w-1.5 rounded-full ${isMetaConnected ? "bg-green-400 animate-pulse" : "bg-white"}`} />
                    </div>
                    <Instagram className={`h-6 w-6 ${isMetaConnected ? "text-pink-400" : "text-white"}`} />

                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 hidden scale-95 opacity-0 group-hover:block group-hover:scale-100 group-hover:opacity-100 transition-all duration-200">
                        <div className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap shadow-xl">
                            Integração Meta
                        </div>
                    </div>
                </button>
            )}

            {/* Panel */}
            {isOpen && (
                <div className="animate-in slide-in-from-bottom-4 fade-in zoom-in duration-300">
                    <Card className="w-[320px] sm:w-[380px] border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                        <Instagram className="h-6 w-6 text-pink-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase tracking-tight">Meta Integration</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full ${isMetaConnected ? "bg-green-400" : "bg-slate-500"}`} />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {isMetaConnected ? "Ativa" : "Desconectada"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            {!isMetaConnected ? (
                                <div className="flex flex-col items-center text-center">
                                    <div className="flex -space-x-3 mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center border-4 border-white shadow-sm">
                                            <Facebook className="h-7 w-7 text-blue-600" />
                                        </div>
                                        <div className="h-14 w-14 rounded-2xl bg-pink-50 flex items-center justify-center border-4 border-white shadow-sm">
                                            <Instagram className="h-7 w-7 text-pink-600" />
                                        </div>
                                    </div>
                                    <h4 className="text-base font-black text-slate-800 mb-2">Conectar {clientName}</h4>
                                    <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                                        Vincule a conta comercial para liberar o agendamento automático de posts.
                                    </p>
                                    <Button
                                        onClick={handleConnect}
                                        disabled={isLoading}
                                        className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            "Acessar via Facebook"
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-md">
                                                <Instagram className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Conectado como</p>
                                                <p className="text-sm font-black text-slate-900 leading-none">{igBusinessName || "Instagram Business"}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleDisconnect}
                                            disabled={isLoading}
                                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl h-10 w-10 transition-colors"
                                        >
                                            <Link2Off className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="flex items-start gap-3 p-5 rounded-[1.5rem] bg-blue-50/50 border border-blue-100/50 shadow-inner">
                                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-blue-900 mb-1">Status da API: Estável</p>
                                            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                                                Seus posts serão disparados automaticamente nas datas agendadas. Verifique a conexão a cada 60 dias.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
